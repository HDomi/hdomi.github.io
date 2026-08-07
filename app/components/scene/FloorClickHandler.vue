<script setup lang="ts">
import type { TresPointerEvent } from "@tresjs/core";
import { useLoop } from "@tresjs/core";
import {
  boxCollidersFromMarkers,
  collidesAt,
  ROOM_BOUNDS,
  useFactoryScene,
} from "~/composables/useFactoryScene";

const scene = useFactoryScene();
const { onBeforeRender } = useLoop();

const pulse = ref(1);
const markerVisible = computed(() => scene.moveTarget.value !== null);
const markerPos = computed(() => {
  const t = scene.moveTarget.value;
  if (!t) return [0, 0.04, 0] as [number, number, number];
  return [t.x, 0.04, t.z] as [number, number, number];
});

onBeforeRender(({ elapsed }) => {
  if (!markerVisible.value) return;
  pulse.value = 1 + Math.sin(elapsed * 6) * 0.12;
});

/**
 * 바닥 클릭 지점으로 이동 목표를 설정한다.
 * @param {TresPointerEvent} event - Tres 포인터 이벤트
 */
function onFloorClick(event: TresPointerEvent) {
  if (scene.cameraMode.value !== "third") return;
  const point = event.point;
  if (!point) return;
  const x = Math.min(ROOM_BOUNDS.maxX, Math.max(ROOM_BOUNDS.minX, point.x));
  const z = Math.min(ROOM_BOUNDS.maxZ, Math.max(ROOM_BOUNDS.minZ, point.z));
  const dynamic = boxCollidersFromMarkers(scene.portfolioBoxes.value);
  if (collidesAt(x, z, dynamic)) return;
  scene.setMoveTarget(x, z);
}
</script>

<template>
  <TresMesh
    :rotation="[-Math.PI / 2, 0, 0]"
    :position="[0, 0.02, 0]"
    :visible="false"
    @click="onFloorClick"
  >
    <TresPlaneGeometry :args="[24, 20]" />
    <TresMeshBasicMaterial transparent :opacity="0" />
  </TresMesh>

  <!-- 클릭 이동 목표 마커 -->
  <TresGroup v-if="markerVisible" :position="markerPos" :scale="[pulse, 1, pulse]">
    <!-- 바닥 글로우 -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.01, 0]">
      <TresCircleGeometry :args="[0.55, 32]" />
      <TresMeshBasicMaterial
        color="#39ff14"
        :transparent="true"
        :opacity="0.22"
        :depth-write="false"
      />
    </TresMesh>
    <!-- 외곽 링 -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.02, 0]">
      <TresRingGeometry :args="[0.38, 0.48, 48]" />
      <TresMeshBasicMaterial
        color="#7dff9a"
        :transparent="true"
        :opacity="0.95"
        :depth-write="false"
      />
    </TresMesh>
    <!-- 안쪽 링 -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.025, 0]">
      <TresRingGeometry :args="[0.14, 0.2, 32]" />
      <TresMeshBasicMaterial
        color="#39ff14"
        :transparent="true"
        :opacity="0.9"
        :depth-write="false"
      />
    </TresMesh>
    <!-- 중심점 -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.03, 0]">
      <TresCircleGeometry :args="[0.07, 16]" />
      <TresMeshBasicMaterial color="#e8ffe8" :depth-write="false" />
    </TresMesh>
    <!-- 십자 표시 -->
    <TresMesh :position="[0, 0.035, 0]">
      <TresBoxGeometry :args="[0.72, 0.02, 0.06]" />
      <TresMeshBasicMaterial
        color="#39ff14"
        :transparent="true"
        :opacity="0.85"
        :depth-write="false"
      />
    </TresMesh>
    <TresMesh :position="[0, 0.035, 0]">
      <TresBoxGeometry :args="[0.06, 0.02, 0.72]" />
      <TresMeshBasicMaterial
        color="#39ff14"
        :transparent="true"
        :opacity="0.85"
        :depth-write="false"
      />
    </TresMesh>
  </TresGroup>
</template>
