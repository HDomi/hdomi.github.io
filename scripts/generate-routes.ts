import fs from "node:fs";
import path from "node:path";

// Load .env file manually if running locally to populate process.env
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

import { fetchFromFirebase } from "../server/utils/firebase";

async function main() {
  try {
    console.log("Fetching posts from Firebase to generate dynamic routes...");
    const rawPosts = await fetchFromFirebase<Record<string, any>>("/posts.json");
    if (!rawPosts) {
      console.log("No posts found. Writing empty routes.");
      fs.writeFileSync("prerender-routes.json", JSON.stringify([]));
      return;
    }

    const uuids = Object.values(rawPosts)
      .filter((p: any) => p && p.uuid)
      .map((p: any) => `/blog/${p.uuid}`);

    console.log(`Found ${uuids.length} posts. Writing to prerender-routes.json...`);
    fs.writeFileSync("prerender-routes.json", JSON.stringify(uuids, null, 2));
    console.log("Prerender routes written successfully!");
  } catch (error) {
    console.error("Failed to generate routes:", error);
    process.exit(1);
  }
}

main();
