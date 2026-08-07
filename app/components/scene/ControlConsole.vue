<script setup lang="ts">
import type { Texture } from "three";
import { CONSOLE_POSITION, useFactoryScene } from "~/composables/useFactoryScene";
import { createPanelTexture } from "~/utils/pixelTextures";

const scene = useFactoryScene();
const INTERACT_DISTANCE = 2.4;
/** 콘솔 앞쪽(+Z) 정면 스탠드오프 */
const CONSOLE_APPROACH_Z = 2.0;
const panelMap = shallowRef<Texture | null>(null);
const ready = ref(false);
const hovered = ref(false);

onMounted(() => {
  panelMap.value = createPanelTexture();
  ready.value = true;
});

onBeforeUnmount(() => {
  panelMap.value?.dispose();
  document.body.style.cursor = "";
});

watchEffect(() => {
  const dx = scene.playerPos.value.x - CONSOLE_POSITION.x;
  const dz = scene.playerPos.value.z - CONSOLE_POSITION.z;
  scene.nearbyConsole.value = Math.hypot(dx, dz) < INTERACT_DISTANCE;
});

/**
 * 콘솔 호버 시작
 */
function handleEnter() {
  hovered.value = true;
  document.body.style.cursor = "pointer";
}

/**
 * 콘솔 호버 종료
 */
function handleLeave() {
  hovered.value = false;
  document.body.style.cursor = "";
}

/**
 * 콘솔 클릭 시 앞으로 이동하고, 이미 근접하면 오버레이를 연다.
 * @param {Event} [event] - 포인터 이벤트
 */
function handleConsoleClick(event?: Event) {
  if (event && "stopPropagation" in event) {
    event.stopPropagation();
  }
  scene.setMoveTarget(CONSOLE_POSITION.x, CONSOLE_POSITION.z + CONSOLE_APPROACH_Z);
  if (scene.nearbyConsole.value) {
    scene.openConsole();
  }
}
</script>

<template>
  <TresGroup
    v-if="ready"
    :position="[CONSOLE_POSITION.x, 0, CONSOLE_POSITION.z]"
    @pointerenter="handleEnter"
    @pointerleave="handleLeave"
    @click="handleConsoleClick($event)"
  >
    <!-- Neon outline -->
    <TresMesh v-if="hovered" :position="[0, 0.9, 0.1]" :scale="[1.08, 1.12, 1.1]">
      <TresBoxGeometry :args="[1.9, 1.8, 1.35]" />
      <TresMeshBasicMaterial color="#7dffb0" wireframe :transparent="true" :opacity="0.95" />
    </TresMesh>
    <TresMesh v-if="hovered" :position="[0, 0.9, 0.1]" :scale="[1.04, 1.06, 1.05]">
      <TresBoxGeometry :args="[1.9, 1.8, 1.35]" />
      <TresMeshBasicMaterial
        color="#9effe0"
        :transparent="true"
        :opacity="0.1"
        :depth-write="false"
      />
    </TresMesh>

    <TresMesh :position="[0, 0.55, 0]" cast-shadow>
      <TresBoxGeometry :args="[1.9, 1.1, 1.25]" />
      <TresMeshStandardMaterial
        :map="panelMap"
        :flat-shading="true"
        metalness="0.4"
        roughness="0.5"
        :emissive="hovered ? '#1a4a33' : '#000000'"
        :emissive-intensity="hovered ? 0.4 : 0"
      />
    </TresMesh>

    <TresMesh :position="[0, 1.35, 0.32]" :rotation="[-0.32, 0, 0]" cast-shadow>
      <TresBoxGeometry :args="[1.7, 0.75, 0.14]" />
      <TresMeshStandardMaterial color="#3a4452" :flat-shading="true" metalness="0.35" roughness="0.55" />
    </TresMesh>

    <TresMesh :position="[0.1, 1.48, 0.42]" :rotation="[-0.32, 0, 0]">
      <TresBoxGeometry :args="[0.86, 0.48, 0.06]" />
      <TresMeshStandardMaterial color="#1a1e24" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[0.1, 1.48, 0.46]" :rotation="[-0.32, 0, 0]">
      <TresPlaneGeometry :args="[0.72, 0.36]" />
      <TresMeshStandardMaterial
        color="#39ff14"
        emissive="#22cc00"
        :emissive-intensity="hovered ? 2.8 : 2.2"
        :flat-shading="true"
      />
    </TresMesh>

    <TresMesh :position="[0.1, 1.55, 0.47]" :rotation="[-0.32, 0, 0]">
      <TresPlaneGeometry :args="[0.5, 0.05]" />
      <TresMeshStandardMaterial color="#0a3d08" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[0.1, 1.42, 0.47]" :rotation="[-0.32, 0, 0]">
      <TresPlaneGeometry :args="[0.35, 0.04]" />
      <TresMeshStandardMaterial color="#0a3d08" :flat-shading="true" />
    </TresMesh>

    <TresMesh :position="[-0.5, 1.18, 0.58]" cast-shadow>
      <TresBoxGeometry :args="[0.18, 0.12, 0.18]" />
      <TresMeshStandardMaterial color="#2f6bff" emissive="#1a4ccc" :emissive-intensity="0.9" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[-0.28, 1.18, 0.58]" cast-shadow>
      <TresBoxGeometry :args="[0.18, 0.12, 0.18]" />
      <TresMeshStandardMaterial color="#ff3030" emissive="#aa1010" :emissive-intensity="0.9" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[-0.06, 1.18, 0.58]" cast-shadow>
      <TresBoxGeometry :args="[0.18, 0.12, 0.18]" />
      <TresMeshStandardMaterial color="#39ff14" emissive="#1fad00" :emissive-intensity="0.8" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[0.16, 1.18, 0.58]" cast-shadow>
      <TresBoxGeometry :args="[0.18, 0.12, 0.18]" />
      <TresMeshStandardMaterial color="#ffcc00" emissive="#bb8800" :emissive-intensity="0.8" :flat-shading="true" />
    </TresMesh>

    <TresGroup :position="[0.5, 1.25, 0.4]">
      <TresMesh cast-shadow>
        <TresBoxGeometry :args="[0.12, 0.12, 0.12]" />
        <TresMeshStandardMaterial color="#6a7484" :flat-shading="true" metalness="0.5" roughness="0.4" />
      </TresMesh>
      <TresMesh :position="[0, 0.22, 0]" :rotation="[0.35, 0, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.08, 0.4, 0.08]" />
        <TresMeshStandardMaterial color="#c0c6d0" :flat-shading="true" metalness="0.55" roughness="0.35" />
      </TresMesh>
      <TresMesh :position="[0, 0.42, 0.08]" cast-shadow>
        <TresBoxGeometry :args="[0.14, 0.1, 0.14]" />
        <TresMeshStandardMaterial color="#e8edf4" :flat-shading="true" />
      </TresMesh>
    </TresGroup>
    <TresGroup :position="[0.72, 1.25, 0.4]">
      <TresMesh cast-shadow>
        <TresBoxGeometry :args="[0.12, 0.12, 0.12]" />
        <TresMeshStandardMaterial color="#6a7484" :flat-shading="true" metalness="0.5" roughness="0.4" />
      </TresMesh>
      <TresMesh :position="[0, 0.22, 0]" :rotation="[-0.25, 0, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.08, 0.4, 0.08]" />
        <TresMeshStandardMaterial color="#c0c6d0" :flat-shading="true" metalness="0.55" roughness="0.35" />
      </TresMesh>
      <TresMesh :position="[0, 0.42, -0.06]" cast-shadow>
        <TresBoxGeometry :args="[0.14, 0.1, 0.14]" />
        <TresMeshStandardMaterial color="#e8edf4" :flat-shading="true" />
      </TresMesh>
    </TresGroup>

    <TresPointLight
      :position="[0.1, 1.65, 0.65]"
      color="#39ff14"
      :intensity="hovered ? 3.2 : 2.4"
      :distance="5"
    />
  </TresGroup>
</template>
