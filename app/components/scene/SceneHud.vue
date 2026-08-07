<script setup lang="ts">
import {
  CONSOLE_POSITION,
  INFO_BOARD_POSITION,
  MINIMAP_FEATURE_CLASSES,
  ROOM_BOUNDS,
  STATIC_COLLIDERS,
  TABLET_POSITION,
  useFactoryScene,
  type AabbCollider,
} from "~/composables/useFactoryScene";

interface Props {
  safeTop: number;
  safeRight: number;
  safeBottom: number;
  safeLeft: number;
}

interface MinimapRect {
  id: string;
  className: string;
  style: Record<string, string>;
}

interface MinimapDot {
  id: string;
  className: string;
  style: Record<string, string>;
}

const props = defineProps<Props>();
const scene = useFactoryScene();

const stickActive = ref(false);
const stickOrigin = ref({ x: 0, y: 0 });
const stickKnob = ref({ x: 0, y: 0 });
const MAX_STICK = 42;

const SPAN_X = ROOM_BOUNDS.maxX - ROOM_BOUNDS.minX;
const SPAN_Z = ROOM_BOUNDS.maxZ - ROOM_BOUNDS.minZ;

const hudStyle = computed(() => ({
  paddingTop: `${Math.max(12, props.safeTop + 8)}px`,
  paddingRight: `${Math.max(12, props.safeRight + 8)}px`,
  paddingBottom: `${Math.max(12, props.safeBottom + 8)}px`,
  paddingLeft: `${Math.max(12, props.safeLeft + 8)}px`,
}));

/**
 * 월드 XZ를 미니맵 % 좌표로 변환한다.
 * @param {number} x - 월드 X
 * @param {number} z - 월드 Z
 * @returns {{ left: string; top: string }} CSS 위치
 */
function worldToPercent(x: number, z: number): { left: string; top: string } {
  const px = ((x - ROOM_BOUNDS.minX) / SPAN_X) * 100;
  const pz = ((z - ROOM_BOUNDS.minZ) / SPAN_Z) * 100;
  return { left: `${px}%`, top: `${pz}%` };
}

/**
 * AABB를 미니맵 박스 스타일로 변환한다.
 * @param {AabbCollider} box - 충돌 박스
 * @returns {Record<string, string>} CSS 스타일
 */
function aabbToStyle(box: AabbCollider): Record<string, string> {
  return {
    left: `${((box.minX - ROOM_BOUNDS.minX) / SPAN_X) * 100}%`,
    top: `${((box.minZ - ROOM_BOUNDS.minZ) / SPAN_Z) * 100}%`,
    width: `${((box.maxX - box.minX) / SPAN_X) * 100}%`,
    height: `${((box.maxZ - box.minZ) / SPAN_Z) * 100}%`,
  };
}

const minimapFeatures = computed<MinimapRect[]>(() =>
  STATIC_COLLIDERS.map((box, index) => ({
    id: `feature-${index}`,
    className: MINIMAP_FEATURE_CLASSES[index] ?? "is-prop",
    style: aabbToStyle(box),
  })),
);

const minimapBoxes = computed<MinimapDot[]>(() =>
  scene.portfolioBoxes.value.map((box) => ({
    id: box.id,
    className: "minimap-box",
    style: worldToPercent(box.x, box.z),
  })),
);

const minimapPlayer = computed(() =>
  worldToPercent(scene.playerPos.value.x, scene.playerPos.value.z),
);

const minimapConsole = computed(() =>
  worldToPercent(CONSOLE_POSITION.x, CONSOLE_POSITION.z),
);

const minimapBoard = computed(() =>
  worldToPercent(INFO_BOARD_POSITION.x, INFO_BOARD_POSITION.z),
);

const minimapTablet = computed(() =>
  worldToPercent(TABLET_POSITION.x, TABLET_POSITION.z),
);

const minimapAspect = computed(() => ({
  aspectRatio: `${SPAN_X} / ${SPAN_Z}`,
}));

/**
 * 조이스틱 포인터 시작
 * @param {PointerEvent} e - 포인터 이벤트
 */
function onStickStart(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement;
  el.setPointerCapture(e.pointerId);
  const rect = el.getBoundingClientRect();
  stickOrigin.value = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
  stickActive.value = true;
  updateStick(e.clientX, e.clientY);
}

/**
 * 조이스틱 포인터 이동
 * @param {PointerEvent} e - 포인터 이벤트
 */
function onStickMove(e: PointerEvent) {
  if (!stickActive.value) return;
  updateStick(e.clientX, e.clientY);
}

/**
 * 조이스틱 포인터 종료
 */
function onStickEnd() {
  stickActive.value = false;
  stickKnob.value = { x: 0, y: 0 };
  scene.setJoystick(0, 0);
}

/**
 * 조이스틱 노브/입력을 갱신한다.
 * @param {number} clientX - 화면 X
 * @param {number} clientY - 화면 Y
 */
function updateStick(clientX: number, clientY: number) {
  let dx = clientX - stickOrigin.value.x;
  let dy = clientY - stickOrigin.value.y;
  const len = Math.hypot(dx, dy);
  if (len > MAX_STICK) {
    dx = (dx / len) * MAX_STICK;
    dy = (dy / len) * MAX_STICK;
  }
  stickKnob.value = { x: dx, y: dy };
  // 화면 위 = 월드 -Z
  scene.setJoystick(dx / MAX_STICK, dy / MAX_STICK);
}

/**
 * 포스팅 오버레이를 연다.
 */
function handleInteract() {
  scene.openConsole();
}

/**
 * 소개보드 오버레이를 연다.
 */
function handleOpenBoard() {
  scene.openInfoBoard();
}

/**
 * 태블릿 챗봇 오버레이를 연다.
 */
function handleOpenTablet() {
  scene.openTablet();
}

/**
 * 외부 프로젝트 링크로 이동한다.
 */
function openFocusedProject() {
  const url = scene.focusedProject.value?.url;
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <div class="scene-hud" :style="hudStyle">
    <div class="hint-bar">
      <template v-if="scene.viewportMode.value === 'wide'">
        <span>WASD 이동</span>
        <span>클릭으로 이동</span>
        <span>E / 콘솔·보드·패드</span>
      </template>
      <template v-else>
        <span>조이스틱·탭으로 이동</span>
        <span>콘솔·보드·패드 상호작용</span>
      </template>
    </div>

    <div v-if="scene.focusedProject.value" class="project-toast">
      <img
        v-if="scene.focusedProject.value.image"
        :src="scene.focusedProject.value.image"
        :alt="scene.focusedProject.value.title"
        class="toast-image"
      />
      <div class="toast-body">
        <strong>{{ scene.focusedProject.value.title }}</strong>
        <p>{{ scene.focusedProject.value.description }}</p>
        <button type="button" class="toast-btn" @click="openFocusedProject">프로젝트 열기</button>
      </div>
    </div>

    <!-- 포트폴리오 박스 기본 툴팁 (이미지+제목) -->
    <div class="box-tooltip-layer" aria-hidden="true">
      <div
        v-for="tip in scene.boxTooltips.value"
        v-show="tip.visible"
        :key="tip.id"
        class="box-tooltip"
        :class="{ 'is-focused': tip.project.url === scene.focusedProject.value?.url }"
        :style="{ left: `${tip.left}px`, top: `${tip.top}px` }"
      >
        <img
          v-if="tip.project.image"
          :src="tip.project.image"
          :alt="tip.project.title"
          class="box-tooltip-image"
          loading="lazy"
        />
        <div v-else class="box-tooltip-image is-placeholder">📦</div>
        <span class="box-tooltip-title">{{ tip.project.title || tip.project.siteName }}</span>
      </div>

      <div
        v-show="scene.consoleTooltip.value.visible"
        class="console-tooltip"
        :class="{ 'is-nearby': scene.nearbyConsole.value }"
        :style="{
          left: `${scene.consoleTooltip.value.left}px`,
          top: `${scene.consoleTooltip.value.top}px`,
        }"
      >
        포스팅 콘솔
      </div>

      <div
        v-show="scene.infoBoardTooltip.value.visible"
        class="console-tooltip is-board"
        :class="{ 'is-nearby': scene.nearbyInfoBoard.value }"
        :style="{
          left: `${scene.infoBoardTooltip.value.left}px`,
          top: `${scene.infoBoardTooltip.value.top}px`,
        }"
      >
        블로그 소개
      </div>

      <div
        v-show="scene.tabletTooltip.value.visible"
        class="console-tooltip is-tablet"
        :class="{ 'is-nearby': scene.nearbyTablet.value }"
        :style="{
          left: `${scene.tabletTooltip.value.left}px`,
          top: `${scene.tabletTooltip.value.top}px`,
        }"
      >
        챗봇
      </div>
    </div>

    <div class="minimap" aria-hidden="true">
      <div class="minimap-room" :style="minimapAspect">
        <div
          v-for="feature in minimapFeatures"
          :key="feature.id"
          class="minimap-feature"
          :class="feature.className"
          :style="feature.style"
        />
        <div
          v-for="box in minimapBoxes"
          :key="box.id"
          class="minimap-box"
          :style="box.style"
        />
        <div class="minimap-console-ping" :style="minimapConsole" />
        <div class="minimap-board-ping" :style="minimapBoard" />
        <div class="minimap-tablet-ping" :style="minimapTablet" />
        <div class="minimap-player" :style="minimapPlayer" />
      </div>
    </div>

    <div
      v-if="scene.viewportMode.value === 'narrow' && scene.cameraMode.value === 'third'"
      class="joystick"
      @pointerdown="onStickStart"
      @pointermove="onStickMove"
      @pointerup="onStickEnd"
      @pointercancel="onStickEnd"
    >
      <div
        class="joystick-knob"
        :style="{ transform: `translate(${stickKnob.x}px, ${stickKnob.y}px)` }"
      />
    </div>

    <div
      v-if="
        scene.cameraMode.value === 'third' &&
        (scene.nearbyConsole.value || scene.nearbyInfoBoard.value || scene.nearbyTablet.value)
      "
      class="interact-stack"
    >
      <button
        v-if="scene.nearbyConsole.value"
        type="button"
        class="interact-btn is-console"
        @click="handleInteract"
      >
        <span class="interact-key">E</span>
        <span class="interact-copy">
          <span class="interact-label">CONSOLE</span>
          <span class="interact-title">포스팅 콘솔</span>
        </span>
      </button>

      <button
        v-if="scene.nearbyInfoBoard.value"
        type="button"
        class="interact-btn is-board"
        @click="handleOpenBoard"
      >
        <span class="interact-key">E</span>
        <span class="interact-copy">
          <span class="interact-label">BOARD</span>
          <span class="interact-title">소개 보드</span>
        </span>
      </button>

      <button
        v-if="scene.nearbyTablet.value"
        type="button"
        class="interact-btn is-tablet"
        @click="handleOpenTablet"
      >
        <span class="interact-key">E</span>
        <span class="interact-copy">
          <span class="interact-label">CHAT</span>
          <span class="interact-title">챗봇</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.scene-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  box-sizing: border-box;
}

.hint-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.85rem;
  color: rgba(230, 235, 240, 0.75);
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}

.hint-bar span {
  background: rgba(10, 12, 16, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
}

.project-toast {
  pointer-events: auto;
  position: absolute;
  left: 50%;
  top: 14%;
  transform: translateX(-50%);
  width: min(380px, calc(100% - 2rem));
  background: rgba(12, 14, 18, 0.92);
  border: 1px solid rgba(0, 200, 255, 0.25);
  border-radius: 12px;
  padding: 0.7rem;
  color: #e8eef4;
  display: flex;
  gap: 0.75rem;
  z-index: 6;
}

.toast-image {
  width: 88px;
  height: 66px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
  background: #1a1f26;
}

.toast-body {
  min-width: 0;
  flex: 1;
}

.project-toast strong {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
}

.project-toast p {
  font-size: 0.8rem;
  color: rgba(200, 210, 220, 0.8);
  margin-bottom: 0.65rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.box-tooltip-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 4;
}

.box-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 118px;
  background: rgba(8, 12, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.box-tooltip.is-focused {
  border-color: rgba(0, 200, 255, 0.55);
  box-shadow: 0 12px 30px rgba(0, 180, 220, 0.28);
}

.box-tooltip-image {
  width: 100%;
  height: 68px;
  object-fit: cover;
  background: #1a2028;
  display: block;
}

.box-tooltip-image.is-placeholder {
  display: grid;
  place-items: center;
  font-size: 1.4rem;
}

.box-tooltip-title {
  padding: 0.35rem 0.45rem 0.45rem;
  font-size: 0.68rem;
  line-height: 1.25;
  color: #eef3f8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.console-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 0.4rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #e8fff0;
  white-space: nowrap;
  background: rgba(8, 12, 18, 0.92);
  border: 1px solid rgba(57, 255, 20, 0.35);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.console-tooltip.is-nearby {
  border-color: rgba(57, 255, 20, 0.7);
  box-shadow: 0 12px 30px rgba(57, 255, 20, 0.22);
}

.console-tooltip.is-board {
  border-color: rgba(0, 200, 255, 0.4);
}

.console-tooltip.is-board.is-nearby {
  border-color: rgba(0, 200, 255, 0.75);
  box-shadow: 0 12px 30px rgba(0, 200, 255, 0.22);
}

.console-tooltip.is-tablet {
  border-color: rgba(255, 229, 102, 0.45);
}

.console-tooltip.is-tablet.is-nearby {
  border-color: rgba(255, 229, 102, 0.8);
  box-shadow: 0 12px 30px rgba(255, 229, 102, 0.22);
}

.toast-btn,
.interact-btn {
  pointer-events: auto;
  border: none;
  cursor: pointer;
  font: inherit;
}

.toast-btn {
  background: #00b7d4;
  color: #041018;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-weight: 600;
  font-size: 0.8rem;
}

.minimap {
  position: absolute;
  right: max(12px, env(safe-area-inset-right));
  bottom: max(12px, env(safe-area-inset-bottom));
  width: 118px;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(8, 10, 14, 0.82);
  border: 1px solid rgba(57, 255, 20, 0.22);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.minimap-room {
  position: relative;
  width: 100%;
  border: 1px solid rgba(120, 140, 160, 0.4);
  border-radius: 4px;
  background:
    linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px),
    rgba(36, 44, 54, 0.72);
  background-size: 12px 12px, 12px 12px, auto;
}

.minimap-feature {
  position: absolute;
  border-radius: 2px;
  box-sizing: border-box;
}

.minimap-feature.is-conveyor {
  background: rgba(120, 140, 160, 0.75);
  border: 1px solid rgba(200, 210, 220, 0.35);
}

.minimap-feature.is-console {
  background: rgba(57, 255, 20, 0.55);
  border: 1px solid rgba(57, 255, 20, 0.85);
  box-shadow: 0 0 6px rgba(57, 255, 20, 0.35);
}

.minimap-feature.is-board {
  background: rgba(0, 200, 255, 0.55);
  border: 1px solid rgba(0, 200, 255, 0.8);
  box-shadow: 0 0 6px rgba(0, 200, 255, 0.35);
}

.minimap-feature.is-rail {
  background: rgba(180, 190, 200, 0.45);
  border: 1px solid rgba(200, 210, 220, 0.35);
}

.minimap-feature.is-pallet {
  background: rgba(160, 120, 70, 0.65);
  border: 1px solid rgba(200, 160, 100, 0.45);
}

.minimap-feature.is-toolbox {
  background: rgba(90, 110, 130, 0.7);
  border: 1px solid rgba(140, 160, 180, 0.45);
}

.minimap-feature.is-desk {
  background: rgba(139, 90, 43, 0.7);
  border: 1px solid rgba(180, 130, 80, 0.5);
}

.minimap-feature.is-machine {
  background: rgba(0, 200, 255, 0.45);
  border: 1px solid rgba(0, 200, 255, 0.55);
}

.minimap-feature.is-furnace {
  background: rgba(255, 106, 0, 0.55);
  border: 1px solid rgba(255, 140, 40, 0.7);
}

.minimap-feature.is-crates {
  background: rgba(138, 95, 56, 0.7);
  border: 1px solid rgba(180, 130, 80, 0.5);
}

.minimap-feature.is-barrels {
  background: rgba(63, 143, 214, 0.55);
  border: 1px solid rgba(214, 90, 63, 0.55);
}

.minimap-feature.is-post,
.minimap-feature.is-prop {
  background: rgba(240, 192, 0, 0.7);
  border: 1px solid rgba(240, 192, 0, 0.5);
}

.minimap-box {
  position: absolute;
  width: 5px;
  height: 5px;
  margin: -2.5px 0 0 -2.5px;
  border-radius: 1px;
  background: #d4b070;
  border: 1px solid rgba(255, 230, 180, 0.5);
  box-sizing: border-box;
}

.minimap-console-ping {
  position: absolute;
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  border-radius: 50%;
  background: #39ff14;
  box-shadow: 0 0 8px #39ff14;
  z-index: 1;
}

.minimap-board-ping {
  position: absolute;
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  border-radius: 50%;
  background: #00c8ff;
  box-shadow: 0 0 8px #00c8ff;
  z-index: 1;
}

.minimap-tablet-ping {
  position: absolute;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 2px;
  background: #ffe566;
  box-shadow: 0 0 8px rgba(255, 229, 102, 0.7);
  z-index: 1;
}

.minimap-player {
  position: absolute;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: #ffd400;
  border: 1.5px solid #ff7a2f;
  box-shadow: 0 0 8px rgba(255, 212, 0, 0.75);
  z-index: 2;
}

.joystick {
  pointer-events: auto;
  position: absolute;
  left: max(20px, env(safe-area-inset-left));
  bottom: max(28px, env(safe-area-inset-bottom));
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  touch-action: none;
}

.joystick-knob {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border-radius: 50%;
  background: rgba(230, 240, 250, 0.85);
}

.interact-stack {
  pointer-events: none;
  position: absolute;
  left: 50%;
  bottom: max(120px, calc(env(safe-area-inset-bottom) + 100px));
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: min(280px, calc(100vw - 2rem));
  z-index: 6;
}

.interact-btn {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(10, 14, 18, 0.88);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  color: #eef3f8;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.interact-btn::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: currentColor;
  opacity: 0.85;
}

.interact-btn:hover,
.interact-btn:focus-visible {
  background: rgba(14, 20, 26, 0.95);
  transform: translateY(-1px);
  outline: none;
}

.interact-key {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-left: 0.25rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(230, 235, 240, 0.9);
}

.interact-copy {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.interact-label {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  color: rgba(170, 185, 200, 0.72);
}

.interact-title {
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #f2f6fa;
}

.interact-btn.is-console {
  color: #39ff14;
  border-color: rgba(57, 255, 20, 0.28);
}

.interact-btn.is-console:hover,
.interact-btn.is-console:focus-visible {
  border-color: rgba(57, 255, 20, 0.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(57, 255, 20, 0.12);
}

.interact-btn.is-board {
  color: #5adfff;
  border-color: rgba(0, 200, 255, 0.28);
}

.interact-btn.is-board:hover,
.interact-btn.is-board:focus-visible {
  border-color: rgba(0, 200, 255, 0.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 200, 255, 0.12);
}

.interact-btn.is-tablet {
  color: #e8c84a;
  border-color: rgba(232, 200, 74, 0.3);
}

.interact-btn.is-tablet:hover,
.interact-btn.is-tablet:focus-visible {
  border-color: rgba(232, 200, 74, 0.55);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(232, 200, 74, 0.12);
}

@media (min-width: 768px) {
  .interact-stack {
    bottom: max(40px, env(safe-area-inset-bottom));
  }

  .minimap {
    width: 148px;
  }
}
</style>
