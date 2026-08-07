import {
  CanvasTexture,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

type PixelPainter = (ctx: CanvasRenderingContext2D, size: number) => void;

/**
 * 저해상도 nearest 필터 픽셀 텍스처를 생성한다.
 * @param {PixelPainter} paint - 캔버스에 픽셀을 그리는 함수
 * @param {number} size - 텍스처 해상도
 * @param {number} repeatX - U 반복
 * @param {number} repeatY - V 반복
 * @returns {Texture} Three.js 텍스처
 */
export function createPixelTexture(
  paint: PixelPainter,
  size: number = 16,
  repeatX: number = 1,
  repeatY: number = 1,
): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D canvas context unavailable");
  }
  paint(ctx, size);
  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * 벽돌 벽 픽셀 텍스처를 만든다.
 * @param {number} repeatX - U 반복
 * @param {number} repeatY - V 반복
 * @returns {Texture} 벽돌 텍스처
 */
export function createBrickTexture(repeatX = 8, repeatY = 4): Texture {
  return createPixelTexture(
    (ctx, size) => {
      ctx.fillStyle = "#4a5260";
      ctx.fillRect(0, 0, size, size);
      const rowH = size / 4;
      const brickW = size / 2;
      for (let row = 0; row < 4; row++) {
        const offset = row % 2 === 0 ? 0 : brickW / 2;
        for (let col = -1; col < 3; col++) {
          const x = col * brickW + offset;
          const y = row * rowH;
          ctx.fillStyle = row % 2 === 0 ? "#5c6574" : "#555e6c";
          ctx.fillRect(x + 1, y + 1, brickW - 2, rowH - 2);
          ctx.fillStyle = "#3a4250";
          ctx.fillRect(x + 1, y + rowH - 2, brickW - 2, 1);
        }
      }
    },
    32,
    repeatX,
    repeatY,
  );
}

/**
 * hex 색을 RGB로 변환한다.
 * @param {string} hex - #RRGGBB
 * @returns {{ r: number; g: number; b: number }} RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

/**
 * 두 색을 t 비율로 보간해 CSS 색 문자열을 만든다.
 * @param {string} a - 시작색
 * @param {string} b - 끝색
 * @param {number} t - 0~1
 * @returns {string} rgb()
 */
function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const r = Math.round(A.r + (B.r - A.r) * t);
  const g = Math.round(A.g + (B.g - A.g) * t);
  const bl = Math.round(A.b + (B.b - A.b) * t);
  return `rgb(${r},${g},${bl})`;
}

/**
 * 메탈 바닥 타일 픽셀 텍스처를 만든다. (고해상도 + 가장자리 소프트 블렌드)
 * @param {string} base - 기본색
 * @param {string} edge - 테두리색
 * @param {number} size - 텍스처 해상도
 * @returns {Texture} 타일 텍스처
 */
export function createMetalTileTexture(
  base = "#6a727e",
  edge = "#4a5564",
  size = 64,
): Texture {
  return createPixelTexture(
    (ctx, s) => {
      const highlight = mixHex(base, "#c5ccd6", 0.35);
      const mid = mixHex(base, edge, 0.45);
      const softEdge = mixHex(base, edge, 0.7);

      // 기본 필 + 미세한 픽셀 노이즈(주변색 보간)
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const n = ((x * 17 + y * 31) % 7) / 7;
          const tone = n < 0.2 ? mixHex(base, highlight, 0.25) : n > 0.85 ? mixHex(base, edge, 0.2) : base;
          ctx.fillStyle = tone;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // 가장자리: 바깥→안쪽으로 색을 부드럽게 퍼뜨림
      const border = Math.max(3, Math.floor(s / 16));
      for (let i = 0; i < border; i++) {
        const t = i / border;
        const color = mixHex(softEdge, base, t * t);
        ctx.fillStyle = color;
        // top / bottom
        for (let x = i; x < s - i; x++) {
          // 디더: 일부 픽셀만 찍어 경계가 계단처럼 딱딱하지 않게
          if (((x + i) & 1) === 0 || t > 0.45) {
            ctx.fillRect(x, i, 1, 1);
            ctx.fillRect(x, s - 1 - i, 1, 1);
          } else {
            ctx.fillStyle = mixHex(softEdge, mid, t);
            ctx.fillRect(x, i, 1, 1);
            ctx.fillRect(x, s - 1 - i, 1, 1);
            ctx.fillStyle = color;
          }
        }
        // left / right
        for (let y = i; y < s - i; y++) {
          if (((y + i) & 1) === 0 || t > 0.45) {
            ctx.fillRect(i, y, 1, 1);
            ctx.fillRect(s - 1 - i, y, 1, 1);
          } else {
            ctx.fillStyle = mixHex(softEdge, mid, t);
            ctx.fillRect(i, y, 1, 1);
            ctx.fillRect(s - 1 - i, y, 1, 1);
            ctx.fillStyle = color;
          }
        }
      }

      // 코너 볼트도 주변색으로 페더링
      const bolt = Math.floor(s * 0.12);
      const inset = Math.floor(s * 0.1);
      for (const [bx, by] of [
        [inset, inset],
        [s - inset - bolt, inset],
        [inset, s - inset - bolt],
        [s - inset - bolt, s - inset - bolt],
      ] as const) {
        for (let oy = -1; oy <= bolt; oy++) {
          for (let ox = -1; ox <= bolt; ox++) {
            const dist = Math.max(Math.abs(ox - bolt / 2), Math.abs(oy - bolt / 2));
            const falloff = Math.min(1, dist / (bolt * 0.9));
            ctx.fillStyle = mixHex(mixHex(edge, mid, 0.35), base, falloff);
            ctx.fillRect(bx + ox, by + oy, 1, 1);
          }
        }
      }
    },
    size,
    1,
    1,
  );
}

/**
 * 넓은 바닥용 연속 타일 픽셀 텍스처를 만든다. (타일 간 경계도 소프트 블렌드)
 * @param {number} size - 텍스처 해상도
 * @returns {Texture} 바닥 텍스처
 */
export function createSoftFloorTexture(size = 128, repeatX = 6, repeatY = 5): Texture {
  const baseA = "#6a727e";
  const baseB = "#646c78";
  const seam = "#535b68";
  return createPixelTexture(
    (ctx, s) => {
      const tile = s / 2;
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const tx = x % tile;
          const ty = y % tile;
          const col = Math.floor(x / tile);
          const row = Math.floor(y / tile);
          const base = (col + row) % 2 === 0 ? baseA : baseB;

          const distEdge = Math.min(tx, ty, tile - 1 - tx, tile - 1 - ty);
          const feather = 5;
          let color = base;
          if (distEdge < feather) {
            const t = distEdge / feather;
            const dither = ((x * 3 + y * 5) % 4) / 4;
            const blend = Math.min(1, t + dither * 0.25);
            color = mixHex(seam, base, blend * blend);
          } else {
            const n = ((x * 13 + y * 29) % 9) / 9;
            if (n < 0.12) color = mixHex(base, "#8a93a0", 0.2);
            else if (n > 0.9) color = mixHex(base, seam, 0.15);
          }

          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    size,
    repeatX,
    repeatY,
  );
}

/**
 * 환기구 그레이트 픽셀 텍스처를 만든다. (고해상도 + 소프트 홀)
 * @returns {Texture} 그레이트 텍스처
 */
export function createGrateTexture(): Texture {
  return createPixelTexture(
    (ctx, size) => {
      const base = "#3a414c";
      const hole = "#1c222a";
      const rim = "#4a5564";
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          ctx.fillStyle = mixHex(base, rim, ((x + y) % 5) / 12);
          ctx.fillRect(x, y, 1, 1);
        }
      }
      const cell = 8;
      for (let gy = 2; gy < size - 2; gy += cell) {
        for (let gx = 2; gx < size - 2; gx += cell) {
          for (let oy = 0; oy < 4; oy++) {
            for (let ox = 0; ox < 4; ox++) {
              const edge = ox === 0 || oy === 0 || ox === 3 || oy === 3;
              ctx.fillStyle = edge ? mixHex(hole, rim, 0.45) : hole;
              ctx.fillRect(gx + ox, gy + oy, 1, 1);
            }
          }
        }
      }
    },
    64,
    1,
    1,
  );
}

/**
 * 골판지 박스 픽셀 텍스처를 만든다.
 * @returns {Texture} 박스 텍스처
 */
export function createCardboardTexture(): Texture {
  return createPixelTexture(
    (ctx, size) => {
      ctx.fillStyle = "#b0793d";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#9a6530";
      for (let y = 0; y < size; y += 2) {
        ctx.fillRect(0, y, size, 1);
      }
      ctx.fillStyle = "#d4a66a";
      ctx.fillRect(2, 2, size - 4, 3);
      ctx.fillStyle = "#6b4420";
      ctx.fillRect(size / 2 - 1, 0, 2, size);
    },
    16,
    1,
    1,
  );
}

/**
 * 박스 라벨 픽셀 텍스처를 만든다.
 * @returns {Texture} 라벨 텍스처
 */
export function createLabelTexture(): Texture {
  return createPixelTexture(
    (ctx, size) => {
      ctx.fillStyle = "#f0e6d4";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(2, 3, size - 4, 2);
      ctx.fillRect(2, 7, size - 6, 2);
      ctx.fillRect(2, 11, size - 8, 2);
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(size - 5, 2, 3, 3);
    },
    16,
    1,
    1,
  );
}

/**
 * 경고 스트라이프 픽셀 텍스처를 만든다. (고해상도 + 소프트 경계)
 * @returns {Texture} 스트라이프 텍스처
 */
export function createHazardTexture(): Texture {
  return createPixelTexture(
    (ctx, size) => {
      const dark = "#2a2f38";
      const yellow = "#e0b020";
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const stripe = Math.floor((x + y) / 6) % 2 === 0;
          const base = stripe ? yellow : dark;
          const other = stripe ? dark : yellow;
          // 스트라이프 경계 근처 픽셀을 보간
          const along = (x + y) % 6;
          const nearEdge = along === 0 || along === 5;
          const dither = ((x * 7 + y * 11) % 3) / 3;
          ctx.fillStyle = nearEdge ? mixHex(base, other, 0.35 + dither * 0.2) : base;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    64,
    6,
    1,
  );
}

/**
 * 금속 패널 픽셀 텍스처를 만든다.
 * @returns {Texture} 패널 텍스처
 */
export function createPanelTexture(): Texture {
  return createPixelTexture(
    (ctx, size) => {
      ctx.fillStyle = "#5a6574";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#3e4652";
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.fillStyle = "#8a95a5";
      ctx.fillRect(3, 3, 2, 2);
      ctx.fillRect(size - 5, 3, 2, 2);
      ctx.fillRect(3, size - 5, 2, 2);
      ctx.fillRect(size - 5, size - 5, 2, 2);
    },
    16,
    2,
    2,
  );
}

/**
 * 나무 테이블용 픽셀 텍스처를 만든다.
 * @returns {Texture} 우드 텍스처
 */
export function createWoodTexture(): Texture {
  return createPixelTexture(
    (ctx, size) => {
      ctx.fillStyle = "#8b5a2b";
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y++) {
        const shade = (y * 7) % 5;
        ctx.fillStyle = shade < 2 ? "#7a4a22" : shade === 4 ? "#9a6a3a" : "#865528";
        ctx.fillRect(0, y, size, 1);
        if (y % 4 === 0) {
          ctx.fillStyle = "#6e3f1c";
          ctx.fillRect(2 + (y % 3), y, size - 6, 1);
        }
      }
      ctx.fillStyle = "#5c3416";
      ctx.fillRect(0, 0, size, 1);
      ctx.fillRect(0, size - 1, size, 1);
    },
    32,
    2,
    2,
  );
}

/**
 * 벽걸이 인포보드 스크린 텍스처를 만든다. (고해상도 픽셀 UI)
 * @returns {Texture} 보드 스크린 텍스처
 */
export function createInfoBoardScreenTexture(): Texture {
  const width = 512;
  const height = 384;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  // 배경
  ctx.fillStyle = "#0a1218";
  ctx.fillRect(0, 0, width, height);

  // 픽셀 그리드 노이즈
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if ((x + y) % 16 === 0) {
        ctx.fillStyle = "rgba(57,255,20,0.04)";
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // 상단 바
  ctx.fillStyle = "#122018";
  ctx.fillRect(0, 0, width, 48);
  ctx.fillStyle = "#39ff14";
  ctx.fillRect(0, 46, width, 2);
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#39ff14";
  ctx.fillText("DOMI // FACTORY BOARD", 20, 30);
  ctx.font = "14px monospace";
  ctx.fillStyle = "#7dff9a";
  ctx.fillText("ONLINE", width - 90, 30);

  // 타이틀
  ctx.font = "bold 36px sans-serif";
  ctx.fillStyle = "#f2f6fa";
  ctx.fillText("Domi Portal", 28, 110);

  // 본문 라인 (글씨)
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#c5d0dc";
  const lines = [
    "실리콘의 연산과 인간의 망각을 성찰하며,",
    "도미가 직접 개발·배포한 웹 프로젝트와",
    "기술 에세이를 기록하는 공간입니다.",
    "",
    "> ARCHIVE  : 우측 포스팅 콘솔",
    "> PROJECTS : 컨베이어 포트폴리오",
    "> TABLET   : 작업대 패드에서 문의",
  ];
  lines.forEach((line, i) => {
    ctx.fillStyle = line.startsWith(">") ? "#8fe9ff" : "#c5d0dc";
    ctx.fillText(line, 28, 150 + i * 26);
  });

  // 하단 상태 바
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, height - 36, width, 36);
  ctx.fillStyle = "#00c8ff";
  ctx.font = "13px monospace";
  ctx.fillText("SYS.OK  |  CLICK TO EXPAND  |  v0.3", 20, height - 14);

  // 픽셀 아이콘 블록들
  const blocks = [
    { x: 380, y: 90, w: 28, h: 28, c: "#39ff14" },
    { x: 416, y: 90, w: 28, h: 28, c: "#00c8ff" },
    { x: 452, y: 90, w: 28, h: 28, c: "#ffcc33" },
    { x: 380, y: 126, w: 100, h: 12, c: "#1a2a22" },
    { x: 380, y: 146, w: 84, h: 12, c: "#1a2a22" },
    { x: 380, y: 166, w: 92, h: 12, c: "#1a2a22" },
  ];
  for (const b of blocks) {
    ctx.fillStyle = b.c;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  // 포스트잇 (텍스처 위에도)
  ctx.fillStyle = "#ffe566";
  ctx.fillRect(400, 210, 88, 88);
  ctx.fillStyle = "#f0d040";
  ctx.fillRect(400, 210, 88, 10);
  ctx.fillStyle = "#5a4010";
  ctx.font = "12px sans-serif";
  ctx.fillText("TODO", 412, 242);
  ctx.fillText("visit", 412, 260);
  ctx.fillText("console!", 412, 276);

  ctx.fillStyle = "#ff9ec8";
  ctx.fillRect(300, 230, 80, 70);
  ctx.fillStyle = "#5a2040";
  ctx.font = "11px sans-serif";
  ctx.fillText("Welcome", 312, 258);
  ctx.fillText(":)", 312, 276);

  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
