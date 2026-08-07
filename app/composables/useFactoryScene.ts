import type { Ref } from "vue";
import type { ViewportMode } from "./useSceneViewport";

export type CameraMode = "third" | "console" | "board" | "tablet";

export interface ProjectItem {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  tags: string[];
}

export interface PostItem {
  uuid: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
}

export interface AabbCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface PortfolioBoxMarker {
  id: string;
  x: number;
  y: number;
  z: number;
  project: ProjectItem;
}

export interface BoxTooltipScreen {
  id: string;
  project: ProjectItem;
  left: number;
  top: number;
  visible: boolean;
}

export interface ConsoleTooltipScreen {
  left: number;
  top: number;
  visible: boolean;
}

export interface InfoBoardTooltipScreen {
  left: number;
  top: number;
  visible: boolean;
}

export interface TabletTooltipScreen {
  left: number;
  top: number;
  visible: boolean;
}

export interface FactorySceneApi {
  cameraMode: Ref<CameraMode>;
  nearbyConsole: Ref<boolean>;
  nearbyInfoBoard: Ref<boolean>;
  nearbyTablet: Ref<boolean>;
  focusedProject: Ref<ProjectItem | null>;
  joystick: Ref<{ x: number; y: number }>;
  moveTarget: Ref<{ x: number; z: number } | null>;
  playerPos: Ref<{ x: number; z: number }>;
  viewportMode: Ref<ViewportMode>;
  posts: Ref<PostItem[]>;
  projects: Ref<ProjectItem[]>;
  portfolioBoxes: Ref<PortfolioBoxMarker[]>;
  boxTooltips: Ref<BoxTooltipScreen[]>;
  consoleTooltip: Ref<ConsoleTooltipScreen>;
  infoBoardTooltip: Ref<InfoBoardTooltipScreen>;
  tabletTooltip: Ref<TabletTooltipScreen>;
  openConsole: () => void;
  closeConsole: () => void;
  openInfoBoard: () => void;
  closeInfoBoard: () => void;
  openTablet: () => void;
  closeTablet: () => void;
  closeOverlay: () => void;
  setJoystick: (x: number, y: number) => void;
  setMoveTarget: (x: number, z: number) => void;
}

/** TresCanvas 경계 밖에서도 공유되도록 모듈 스코프 상태 사용 */
const cameraMode = ref<CameraMode>("third");
const nearbyConsole = ref(false);
const nearbyInfoBoard = ref(false);
const nearbyTablet = ref(false);
const focusedProject = ref<ProjectItem | null>(null);
const joystick = ref({ x: 0, y: 0 });
const moveTarget = ref<{ x: number; z: number } | null>(null);
const playerPos = ref({ x: 0, z: 3.5 });
const viewportMode = ref<ViewportMode>("wide");
const posts = ref<PostItem[]>([]);
const projects = ref<ProjectItem[]>([]);
const portfolioBoxes = ref<PortfolioBoxMarker[]>([]);
const boxTooltips = ref<BoxTooltipScreen[]>([]);
const consoleTooltip = ref<ConsoleTooltipScreen>({
  left: 0,
  top: 0,
  visible: false,
});
const infoBoardTooltip = ref<InfoBoardTooltipScreen>({
  left: 0,
  top: 0,
  visible: false,
});
const tabletTooltip = ref<TabletTooltipScreen>({
  left: 0,
  top: 0,
  visible: false,
});

/**
 * 콘솔 1인칭 모드를 연다.
 */
function openConsole() {
  cameraMode.value = "console";
}

/**
 * 소개보드 오버레이를 연다.
 */
function openInfoBoard() {
  cameraMode.value = "board";
}

/**
 * 태블릿 챗봇 오버레이를 연다.
 */
function openTablet() {
  cameraMode.value = "tablet";
}

/**
 * 3인칭 모드로 되돌린다.
 */
function closeConsole() {
  if (cameraMode.value === "console") cameraMode.value = "third";
}

/**
 * 소개보드 오버레이를 닫는다.
 */
function closeInfoBoard() {
  if (cameraMode.value === "board") cameraMode.value = "third";
}

/**
 * 태블릿 챗봇 오버레이를 닫는다.
 */
function closeTablet() {
  if (cameraMode.value === "tablet") cameraMode.value = "third";
}

/**
 * 열린 오버레이(콘솔/보드/태블릿)를 모두 닫는다.
 */
function closeOverlay() {
  cameraMode.value = "third";
}

/**
 * 가상 조이스틱 입력을 설정한다.
 * @param {number} x - 좌우 -1~1
 * @param {number} y - 전후 -1~1
 */
function setJoystick(x: number, y: number) {
  joystick.value = { x, y };
}

/**
 * 바닥 클릭/탭 이동 목표를 설정한다.
 * @param {number} x - 월드 X
 * @param {number} z - 월드 Z
 */
function setMoveTarget(x: number, z: number) {
  moveTarget.value = { x, z };
}

const api: FactorySceneApi = {
  cameraMode,
  nearbyConsole,
  nearbyInfoBoard,
  nearbyTablet,
  focusedProject,
  joystick,
  moveTarget,
  playerPos,
  viewportMode,
  posts,
  projects,
  portfolioBoxes,
  boxTooltips,
  consoleTooltip,
  infoBoardTooltip,
  tabletTooltip,
  openConsole,
  closeConsole,
  openInfoBoard,
  closeInfoBoard,
  openTablet,
  closeTablet,
  closeOverlay,
  setJoystick,
  setMoveTarget,
};

/**
 * 공장 씬 공유 데이터를 동기화한다.
 * @param {object} options - 외부 데이터
 * @param {PostItem[]} options.posts - 포스팅
 * @param {ProjectItem[]} options.projects - 프로젝트
 * @param {ViewportMode} options.mode - 뷰포트 모드
 */
export function syncFactoryScene(options: {
  posts: PostItem[];
  projects: ProjectItem[];
  mode: ViewportMode;
}) {
  posts.value = options.posts;
  projects.value = options.projects;
  viewportMode.value = options.mode;
}

/**
 * 공장 씬 API를 반환한다.
 * @returns {FactorySceneApi} 씬 API
 */
export function useFactoryScene(): FactorySceneApi {
  return api;
}

/** 방 경계 (플레이어 이동 clamp) */
export const ROOM_BOUNDS = {
  minX: -10.5,
  maxX: 10.5,
  minZ: -8.5,
  maxZ: 8.5,
};

/** 컨트롤 콘솔 월드 좌표 */
export const CONSOLE_POSITION = { x: 8.2, y: 0, z: -5.5 };

/** 컨베이어 벨트 월드 좌표 */
export const CONVEYOR_POSITION = { x: 0, y: 0, z: -5.5 };

/** 블로그 소개보드 월드 좌표 (좌측 벽걸이) */
export const INFO_BOARD_POSITION = { x: -11.72, y: 0, z: 1.6 };

/** 작업대 태블릿 월드 좌표 (좌측 벽 밀착, 보드 남측 — 보드 접근로 확보) */
export const TABLET_POSITION = { x: -10.55, y: 0, z: 3.35 };


/** 플레이어 충돌 반경 */
export const PLAYER_RADIUS = 0.38;

/** 고정 장애물 AABB (벽은 ROOM_BOUNDS로 처리) */
export const STATIC_COLLIDERS: AabbCollider[] = [
  // 컨베이어 본체 (확장)
  { minX: -7.2, maxX: 7.2, minZ: -6.35, maxZ: -4.55 },
  // 콘솔
  { minX: 7.1, maxX: 9.3, minZ: -6.25, maxZ: -4.65 },
  // 좌측 기계
  { minX: -10.2, maxX: -7.2, minZ: -9.0, maxZ: -6.8 },
  // 우측 화로
  { minX: 8.4, maxX: 10.6, minZ: -8.6, maxZ: -6.6 },
  // 나무 상자 더미
  { minX: -4.2, maxX: -1.5, minZ: -8.8, maxZ: -7.2 },
  // 배럴
  { minX: 7.8, maxX: 10.0, minZ: 5.8, maxZ: 7.2 },
  // 경고 포스트
  { minX: -9.1, maxX: -8.5, minZ: 6.9, maxZ: 7.5 },
  { minX: 8.5, maxX: 9.1, minZ: 6.9, maxZ: 7.5 },
  { minX: -9.1, maxX: -8.5, minZ: -2.0, maxZ: -1.4 },
  // 소개보드 (얇은 벽걸이)
  { minX: -11.85, maxX: -11.45, minZ: 0.15, maxZ: 3.05 },
  // 남측 안전 레일/볼라드 영역
  { minX: -9.5, maxX: -8.7, minZ: 7.6, maxZ: 8.3 },
  { minX: -0.4, maxX: 0.4, minZ: 7.6, maxZ: 8.3 },
  { minX: 8.7, maxX: 9.5, minZ: 7.6, maxZ: 8.3 },
  // 팔레트 / 툴박스
  { minX: 3.2, maxX: 5.0, minZ: 5.6, maxZ: 7.0 },
  { minX: -6.8, maxX: -5.2, minZ: 4.8, maxZ: 6.2 },
  // 인포보드 옆 나무 테이블 (벽 밀착, 보드 남측)
  { minX: -11.2, maxX: -9.85, minZ: 2.7, maxZ: 4.05 },
];

/** 미니맵용 피처 클래스 (STATIC_COLLIDERS 인덱스와 대응) */
export const MINIMAP_FEATURE_CLASSES = [
  "is-conveyor",
  "is-console",
  "is-machine",
  "is-furnace",
  "is-crates",
  "is-barrels",
  "is-post",
  "is-post",
  "is-post",
  "is-board",
  "is-rail",
  "is-rail",
  "is-rail",
  "is-pallet",
  "is-toolbox",
  "is-desk",
] as const;

/**
 * 원형 플레이어와 AABB가 겹치는지 검사한다.
 * @param {number} x - 플레이어 X
 * @param {number} z - 플레이어 Z
 * @param {AabbCollider} box - 충돌 박스
 * @param {number} radius - 플레이어 반경
 * @returns {boolean} 충돌 여부
 */
export function overlapsAabb(
  x: number,
  z: number,
  box: AabbCollider,
  radius: number = PLAYER_RADIUS,
): boolean {
  const nearestX = Math.min(box.maxX, Math.max(box.minX, x));
  const nearestZ = Math.min(box.maxZ, Math.max(box.minZ, z));
  const dx = x - nearestX;
  const dz = z - nearestZ;
  return dx * dx + dz * dz < radius * radius;
}

/**
 * 정적+동적 콜라이더와 충돌하는지 검사한다.
 * @param {number} x - X
 * @param {number} z - Z
 * @param {AabbCollider[]} dynamic - 동적 콜라이더
 * @returns {boolean} 충돌 여부
 */
export function collidesAt(x: number, z: number, dynamic: AabbCollider[] = []): boolean {
  if (
    x < ROOM_BOUNDS.minX + PLAYER_RADIUS ||
    x > ROOM_BOUNDS.maxX - PLAYER_RADIUS ||
    z < ROOM_BOUNDS.minZ + PLAYER_RADIUS ||
    z > ROOM_BOUNDS.maxZ - PLAYER_RADIUS
  ) {
    return true;
  }
  for (const box of STATIC_COLLIDERS) {
    if (overlapsAabb(x, z, box)) return true;
  }
  for (const box of dynamic) {
    if (overlapsAabb(x, z, box)) return true;
  }
  return false;
}

/**
 * 축 분리 슬라이딩으로 이동을 해석한다.
 * @param {number} x - 현재 X
 * @param {number} z - 현재 Z
 * @param {number} dx - 이동량 X
 * @param {number} dz - 이동량 Z
 * @param {AabbCollider[]} dynamic - 동적 콜라이더
 * @returns {{ x: number; z: number }} 최종 좌표
 */
export function resolveMove(
  x: number,
  z: number,
  dx: number,
  dz: number,
  dynamic: AabbCollider[] = [],
): { x: number; z: number } {
  const nextX = x + dx;
  const nextZ = z + dz;
  if (!collidesAt(nextX, nextZ, dynamic)) return { x: nextX, z: nextZ };
  if (!collidesAt(nextX, z, dynamic)) return { x: nextX, z };
  if (!collidesAt(x, nextZ, dynamic)) return { x, z: nextZ };
  return { x, z };
}

/**
 * 포트폴리오 박스 마커로부터 동적 AABB를 만든다.
 * @param {PortfolioBoxMarker[]} boxes - 박스 마커
 * @returns {AabbCollider[]} 콜라이더 목록
 */
export function boxCollidersFromMarkers(boxes: PortfolioBoxMarker[]): AabbCollider[] {
  const half = 0.55;
  return boxes.map((b) => ({
    minX: b.x - half,
    maxX: b.x + half,
    minZ: b.z - half,
    maxZ: b.z + half,
  }));
}
