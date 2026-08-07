<script setup lang="ts">
import type { Texture } from "three";
import { TABLET_POSITION, useFactoryScene } from "~/composables/useFactoryScene";
import { createWoodTexture } from "~/utils/pixelTextures";

const scene = useFactoryScene();
const INTERACT_DISTANCE = 2.2;
const APPROACH_X = 1.55;
const woodMap = shallowRef<Texture | null>(null);
const ready = ref(false);
const hovered = ref(false);
const pendingOpen = ref(false);

onMounted(() => {
  woodMap.value = createWoodTexture();
  ready.value = true;
});

onBeforeUnmount(() => {
  woodMap.value?.dispose();
  document.body.style.cursor = "";
});

watchEffect(() => {
  const dx = scene.playerPos.value.x - TABLET_POSITION.x;
  const dz = scene.playerPos.value.z - TABLET_POSITION.z;
  scene.nearbyTablet.value = Math.hypot(dx, dz) < INTERACT_DISTANCE;
  if (pendingOpen.value && scene.nearbyTablet.value) {
    pendingOpen.value = false;
    scene.openTablet();
  }
});

/**
 * 태블릿 호버 시작
 */
function handleEnter() {
  hovered.value = true;
  document.body.style.cursor = "pointer";
}

/**
 * 태블릿 호버 종료
 */
function handleLeave() {
  hovered.value = false;
  document.body.style.cursor = "";
}

/**
 * 태블릿 클릭 시 접근 후 챗봇 오버레이를 연다.
 * @param {Event} [event] - 포인터 이벤트
 */
function handleTabletClick(event?: Event) {
  if (event && "stopPropagation" in event) {
    event.stopPropagation();
  }
  scene.setMoveTarget(TABLET_POSITION.x + APPROACH_X, TABLET_POSITION.z);
  if (scene.nearbyTablet.value) {
    pendingOpen.value = false;
    scene.openTablet();
  } else {
    pendingOpen.value = true;
  }
}
</script>

<template>
  <TresGroup v-if="ready" :position="[TABLET_POSITION.x, 0, TABLET_POSITION.z]">
    <!-- 나무 테이블 (짧은 깊이로 벽 밀착) -->
    <TresMesh :position="[0, 0.78, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[1.35, 0.08, 0.85]" />
      <TresMeshStandardMaterial :map="woodMap" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[-0.52, 0.4, -0.28]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.78, 0.1]" />
      <TresMeshStandardMaterial :map="woodMap" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[0.52, 0.4, -0.28]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.78, 0.1]" />
      <TresMeshStandardMaterial :map="woodMap" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[-0.52, 0.4, 0.28]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.78, 0.1]" />
      <TresMeshStandardMaterial :map="woodMap" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[0.52, 0.4, 0.28]" cast-shadow>
      <TresBoxGeometry :args="[0.1, 0.78, 0.1]" />
      <TresMeshStandardMaterial :map="woodMap" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[0, 0.83, 0]" cast-shadow>
      <TresBoxGeometry :args="[1.38, 0.03, 0.88]" />
      <TresMeshStandardMaterial color="#6e421c" :flat-shading="true" roughness="0.9" />
    </TresMesh>

    <!-- 넓은 직사각형 태블릿 (가로로 눕힘) -->
    <TresGroup
      :position="[0.08, 0.88, 0.02]"
      :rotation="[-0.12, 0, 0]"
      @pointerenter="handleEnter"
      @pointerleave="handleLeave"
      @click="handleTabletClick($event)"
    >
      <TresMesh v-if="hovered" :scale="[1.06, 1.2, 1.08]">
        <TresBoxGeometry :args="[0.92, 0.03, 0.58]" />
        <TresMeshBasicMaterial color="#7dffb0" wireframe :transparent="true" :opacity="0.95" />
      </TresMesh>

      <!-- 본체: 넓은 가로형 -->
      <TresMesh cast-shadow>
        <TresBoxGeometry :args="[0.9, 0.028, 0.56]" />
        <TresMeshStandardMaterial color="#1a1c20" :flat-shading="true" metalness="0.4" roughness="0.45" />
      </TresMesh>
      <!-- 스크린 -->
      <TresMesh :position="[0, 0.016, 0]">
        <TresBoxGeometry :args="[0.82, 0.01, 0.48]" />
        <TresMeshStandardMaterial
          color="#0e1a22"
          emissive="#123040"
          :emissive-intensity="hovered ? 1.25 : 0.75"
          :flat-shading="true"
          roughness="0.3"
        />
      </TresMesh>
      <!-- 홈 인디케이터 -->
      <TresMesh :position="[0, 0.02, 0.2]">
        <TresBoxGeometry :args="[0.16, 0.006, 0.018]" />
        <TresMeshStandardMaterial color="#8a94a4" :flat-shading="true" />
      </TresMesh>
      <!-- UI 픽셀 바 -->
      <TresMesh :position="[0, 0.021, -0.08]">
        <TresBoxGeometry :args="[0.5, 0.005, 0.035]" />
        <TresMeshStandardMaterial
          color="#39ff14"
          emissive="#39ff14"
          :emissive-intensity="1"
          :flat-shading="true"
        />
      </TresMesh>
      <TresMesh :position="[-0.18, 0.021, 0.02]">
        <TresBoxGeometry :args="[0.28, 0.005, 0.028]" />
        <TresMeshStandardMaterial
          color="#00c8ff"
          emissive="#00c8ff"
          :emissive-intensity="0.8"
          :flat-shading="true"
        />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
