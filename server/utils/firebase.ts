import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

interface ServiceAccount {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

function signJwt(payload: object, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${base64Header}.${base64Payload}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(token);
  const signature = sign.sign(privateKey, "base64url");
  return `${token}.${signature}`;
}

async function getAccessToken(serviceAccount: ServiceAccount): Promise<string | null> {
  if (!serviceAccount.private_key || !serviceAccount.client_email) {
    console.warn(
      "[Firebase] No private_key or client_email found. Bypassing OAuth token generation.",
    );
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  const payload = {
    iss: serviceAccount.client_email,
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.database",
    aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const jwt = signJwt(payload, serviceAccount.private_key);

  const res = await fetch(payload.aud, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OAuth token exchange failed: ${res.status} - ${errText}`);
  }

  const data = (await res.json()) as { access_token: string };
  cachedToken = {
    token: data.access_token,
    expiresAt: now + 3600,
  };
  return data.access_token;
}

function parseServiceAccountJson(jsonStr: string): ServiceAccount {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    try {
      const fixedJsonStr = jsonStr
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"');
      return JSON.parse(fixedJsonStr);
    } catch (err) {
      throw new Error(
        `Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Original error: ${(e as Error).message}. Parse attempt error: ${(err as Error).message}`,
      );
    }
  }
}

export async function fetchFromFirebase<T = unknown>(dbPath: string): Promise<T | null> {
  const databaseUrl = process.env.FIREBASE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing FIREBASE_DATABASE_URL environment variable.");
  }

  const isLocalDev = process.env.NODE_ENV !== "production";
  let serviceAccount: ServiceAccount;

  if (isLocalDev) {
    const firebaseJsonPath = path.join(process.cwd(), "firebase.json");
    if (fs.existsSync(firebaseJsonPath)) {
      // 1. 개발 환경에서 루트 경로의 firebase.json을 최우선으로 사용하여 인증 정보 획득
      const firebaseJsonContent = fs.readFileSync(firebaseJsonPath, "utf8");
      serviceAccount = JSON.parse(firebaseJsonContent);
    } else {
      // 2. firebase.json이 없는 경우 기존 .env 분석 로직으로 백업
      let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (!serviceAccountJson || serviceAccountJson.trim() === "{") {
        const envPath = path.join(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_JSON\s*=\s*(\{[\s\S]*?\})/);
          if (match) {
            serviceAccountJson = match[1].trim();
          }
        }
      }

      if (!serviceAccountJson) {
        throw new Error(
          "Missing FIREBASE_SERVICE_ACCOUNT_JSON env variable or firebase.json file.",
        );
      }
      serviceAccount = parseServiceAccountJson(serviceAccountJson);
    }
  } else {
    // 3. 배포 환경 (Production)에서는 환경 변수만 사용
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
    }
    serviceAccount = parseServiceAccountJson(serviceAccountJson);
  }

  const token = await getAccessToken(serviceAccount);
  const cleanDbUrl = databaseUrl.replace(/\/$/, "");

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${cleanDbUrl}${dbPath}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`Firebase request failed: ${res.status} - ${await res.text()}`);
  }

  const data = await res.json();
  return data as T;
}
