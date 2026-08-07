<script setup lang="ts">
import { useFactoryScene } from "~/composables/useFactoryScene";

interface Props {
  narrow: boolean;
}

defineProps<Props>();
const scene = useFactoryScene();

/**
 * 소개보드 오버레이를 닫는다.
 */
function handleClose() {
  scene.closeInfoBoard();
}
</script>

<template>
  <Transition name="board-zoom">
    <div
      v-if="scene.cameraMode.value === 'board'"
      class="info-board-overlay"
      :class="{ 'is-narrow': narrow }"
      role="dialog"
      aria-modal="true"
      aria-label="블로그 소개"
    >
      <div class="info-board-panel">
        <div class="panel-chrome" aria-hidden="true">
          <span class="chrome-dot"></span>
          <span class="chrome-dot"></span>
          <span class="chrome-dot"></span>
          <span class="chrome-label">FACTORY // ABOUT</span>
          <span class="chrome-status">ONLINE</span>
          <button type="button" class="close-x" aria-label="닫기" @click="handleClose">×</button>
        </div>

        <div class="panel-body">
          <p class="system-label">SYS · BLOG INTRO</p>
          <h2>Domi Portal</h2>
          <p class="lead">
            실리콘의 연산과 인간의 망각을 성찰하며, 도미가 직접 개발하고 배포한 웹 프로젝트 및 기술
            에세이를 기록하는 공간입니다.
          </p>

          <div class="info-grid">
            <div class="info-card">
              <span class="info-key">ZONE</span>
              <strong>3D Factory Lobby</strong>
            </div>
            <div class="info-card">
              <span class="info-key">ARCHIVE</span>
              <strong>우측 포스팅 콘솔</strong>
            </div>
            <div class="info-card">
              <span class="info-key">PROJECTS</span>
              <strong>컨베이어 포트폴리오 박스</strong>
            </div>
            <div class="info-card">
              <span class="info-key">OPERATOR</span>
              <strong>hdomi</strong>
            </div>
          </div>

          <p class="footnote">
            WASD / 클릭으로 이동하고, 콘솔과 박스를 탐색하세요. Esc 또는 × 로 이 보드를 닫을 수
            있습니다.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.info-board-overlay {
  position: absolute;
  inset: 0;
  z-index: 22;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  box-sizing: border-box;
  padding: 10%;
  background: rgba(4, 8, 12, 0.55);
  backdrop-filter: blur(4px);
}

.info-board-overlay.is-narrow {
  padding: 5%;
}

.info-board-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(10, 14, 18, 0.96);
  border: 1px solid rgba(57, 255, 20, 0.35);
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transform-origin: center center;
}

.panel-chrome {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(57, 255, 20, 0.08), transparent);
}

.chrome-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3a4250;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.chrome-dot:nth-child(1) {
  background: #ff5f57;
}

.chrome-dot:nth-child(2) {
  background: #febc2e;
}

.chrome-dot:nth-child(3) {
  background: #28c840;
}

.chrome-label {
  margin-left: 0.55rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: rgba(170, 185, 200, 0.75);
}

.chrome-status {
  margin-left: auto;
  margin-right: 0.75rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: #39ff14;
  text-shadow: 0 0 8px rgba(57, 255, 20, 0.45);
}

.close-x {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: #e8eef4;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  font: inherit;
}

.close-x:hover,
.close-x:focus-visible {
  border-color: rgba(57, 255, 20, 0.55);
  color: #39ff14;
  outline: none;
}

.panel-body {
  flex: 1;
  overflow: auto;
  padding: clamp(1.25rem, 3vw, 2.5rem);
}

.system-label {
  color: #39ff14;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  margin-bottom: 0.65rem;
}

.panel-body h2 {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  color: #f2f6fa;
  margin-bottom: 1rem;
  font-weight: 700;
}

.lead {
  color: rgba(197, 208, 220, 0.92);
  font-size: clamp(0.95rem, 1.6vw, 1.15rem);
  line-height: 1.75;
  max-width: 52rem;
  margin-bottom: 1.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(57, 255, 20, 0.18);
  background: rgba(57, 255, 20, 0.05);
}

.info-key {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: #00c8ff;
}

.info-card strong {
  color: #eef5fa;
  font-size: 0.95rem;
  font-weight: 600;
}

.footnote {
  color: rgba(170, 185, 200, 0.7);
  font-size: 0.85rem;
  line-height: 1.6;
}

.board-zoom-enter-active,
.board-zoom-leave-active {
  transition: opacity 0.28s ease;
}

.board-zoom-enter-active .info-board-panel,
.board-zoom-leave-active .info-board-panel {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s ease;
}

.board-zoom-enter-from,
.board-zoom-leave-to {
  opacity: 0;
}

.board-zoom-enter-from .info-board-panel,
.board-zoom-leave-to .info-board-panel {
  opacity: 0;
  transform: scale(0.86);
}
</style>
