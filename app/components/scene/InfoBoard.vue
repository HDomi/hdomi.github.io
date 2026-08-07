<script setup lang="ts">
import type { Texture } from "three";
import { INFO_BOARD_POSITION, useFactoryScene } from "~/composables/useFactoryScene";
import {
  createInfoBoardScreenTexture,
  createPanelTexture,
} from "~/utils/pixelTextures";

const scene = useFactoryScene();
const INTERACT_DISTANCE = 2.8;
/** 보드 앞(+X) 스탠드오프 */
const BOARD_APPROACH_X = 2.2;
const panelMap = shallowRef<Texture | null>(null);
const screenMap = shallowRef<Texture | null>(null);
const ready = ref(false);
const hovered = ref(false);
const pendingOpen = ref(false);

const postIts = [
  { y: 2.55, z: 1.05, color: "#ffe566", rot: 0.12 },
  { y: 2.35, z: 1.15, color: "#ff9ec8", rot: -0.18 },
  { y: 1.15, z: 1.1, color: "#9effc8", rot: 0.08 },
];

onMounted(() => {
  panelMap.value = createPanelTexture();
  screenMap.value = createInfoBoardScreenTexture();
  ready.value = true;
});

onBeforeUnmount(() => {
  panelMap.value?.dispose();
  screenMap.value?.dispose();
  document.body.style.cursor = "";
});

watchEffect(() => {
  const dx = scene.playerPos.value.x - INFO_BOARD_POSITION.x;
  const dz = scene.playerPos.value.z - INFO_BOARD_POSITION.z;
  scene.nearbyInfoBoard.value = Math.hypot(dx, dz) < INTERACT_DISTANCE;
  if (pendingOpen.value && scene.nearbyInfoBoard.value) {
    pendingOpen.value = false;
    scene.openInfoBoard();
  }
});

/**
 * 보드 호버 시작
 */
function handleEnter() {
  hovered.value = true;
  document.body.style.cursor = "pointer";
}

/**
 * 보드 호버 종료
 */
function handleLeave() {
  hovered.value = false;
  document.body.style.cursor = "";
}

/**
 * 보드 클릭 시 앞으로 이동하고, 근접하면 오버레이를 연다.
 * @param {Event} [event] - 포인터 이벤트
 */
function handleBoardClick(event?: Event) {
  if (event && "stopPropagation" in event) {
    event.stopPropagation();
  }
  scene.setMoveTarget(
    INFO_BOARD_POSITION.x + BOARD_APPROACH_X,
    INFO_BOARD_POSITION.z,
  );
  if (scene.nearbyInfoBoard.value) {
    pendingOpen.value = false;
    scene.openInfoBoard();
  } else {
    pendingOpen.value = true;
  }
}
</script>

<template>
  <TresGroup
    v-if="ready"
    :position="[INFO_BOARD_POSITION.x, 0, INFO_BOARD_POSITION.z]"
    @pointerenter="handleEnter"
    @pointerleave="handleLeave"
    @click="handleBoardClick($event)"
  >
    <!-- 호버 아웃라인 (얇은 TV) -->
    <TresMesh v-if="hovered" :position="[0.06, 2.05, 0]" :scale="[1.05, 1.04, 1.02]">
      <TresBoxGeometry :args="[0.08, 1.85, 2.85]" />
      <TresMeshBasicMaterial color="#7dffb0" wireframe :transparent="true" :opacity="0.95" />
    </TresMesh>

    <!-- 벽걸이 브라켓 -->
    <TresMesh :position="[-0.02, 2.5, -0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 0.12, 0.28]" />
      <TresMeshStandardMaterial color="#3a4250" :flat-shading="true" metalness="0.6" roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[-0.02, 2.5, 0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 0.12, 0.28]" />
      <TresMeshStandardMaterial color="#3a4250" :flat-shading="true" metalness="0.6" roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[-0.02, 1.55, -0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 0.12, 0.28]" />
      <TresMeshStandardMaterial color="#3a4250" :flat-shading="true" metalness="0.6" roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[-0.02, 1.55, 0.9]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 0.12, 0.28]" />
      <TresMeshStandardMaterial color="#3a4250" :flat-shading="true" metalness="0.6" roughness="0.4" />
    </TresMesh>

    <!-- 얇은 블랙 베젤 (벽걸이 TV) -->
    <TresMesh :position="[0.02, 2.05, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 1.78, 2.72]" />
      <TresMeshStandardMaterial color="#111418" :flat-shading="true" roughness="0.55" metalness="0.35" />
    </TresMesh>
    <!-- 이너 베젤 -->
    <TresMesh :position="[0.045, 2.05, 0]">
      <TresBoxGeometry :args="[0.02, 1.62, 2.52]" />
      <TresMeshStandardMaterial color="#1c2228" :flat-shading="true" roughness="0.7" />
    </TresMesh>

    <!-- 스크린 (상세 픽셀 UI 텍스처) -->
    <TresMesh :position="[0.06, 2.05, 0]" :rotation="[0, Math.PI / 2, 0]">
      <TresPlaneGeometry :args="[2.42, 1.52]" />
      <TresMeshStandardMaterial
        :map="screenMap"
        :flat-shading="true"
        roughness="0.35"
        metalness="0.05"
        emissive="#0a1810"
        :emissive-intensity="0.55"
      />
    </TresMesh>

    <!-- LED 상태등 -->
    <TresMesh :position="[0.07, 1.22, 1.2]">
      <TresBoxGeometry :args="[0.03, 0.04, 0.08]" />
      <TresMeshStandardMaterial
        color="#39ff14"
        emissive="#39ff14"
        :emissive-intensity="1.6"
        :flat-shading="true"
      />
    </TresMesh>

    <!-- 물리 포스트잇 (스크린 가장자리) -->
    <TresMesh
      v-for="(note, i) in postIts"
      :key="`note-${i}`"
      :position="[0.09, note.y, note.z]"
      :rotation="[0, 0, note.rot]"
      cast-shadow
    >
      <TresBoxGeometry :args="[0.02, 0.28, 0.28]" />
      <TresMeshStandardMaterial :color="note.color" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <!-- 포스트잇 그림자 테이프 -->
    <TresMesh :position="[0.1, 2.66, 1.05]">
      <TresBoxGeometry :args="[0.015, 0.04, 0.18]" />
      <TresMeshStandardMaterial color="#d8c8a0" :flat-shading="true" roughness="0.9" />
    </TresMesh>

    <!-- 하단 케이블 / 슬림 포트 -->
    <TresMesh :position="[0.05, 1.12, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.04, 0.06, 0.9]" />
      <TresMeshStandardMaterial :map="panelMap" :flat-shading="true" metalness="0.45" roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[0.12, 1.05, -0.35]" :rotation="[0.4, 0, 0.2]" cast-shadow>
      <TresBoxGeometry :args="[0.04, 0.04, 0.55]" />
      <TresMeshStandardMaterial color="#2a3038" :flat-shading="true" />
    </TresMesh>

    <TresPointLight :position="[0.45, 2.1, 0]" color="#7dff9a" :intensity="1.6" :distance="5" />
  </TresGroup>
</template>
