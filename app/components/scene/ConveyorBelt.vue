<script setup lang="ts">
import type { Texture } from "three";
import { useLoop } from "@tresjs/core";
import { CONVEYOR_POSITION, useFactoryScene } from "~/composables/useFactoryScene";
import type { ProjectItem } from "~/composables/useFactoryScene";
import {
  createCardboardTexture,
  createLabelTexture,
  createPanelTexture,
} from "~/utils/pixelTextures";

interface Props {
  projects: ProjectItem[];
}

const props = defineProps<Props>();
const scene = useFactoryScene();

const hoveredId = ref<string | null>(null);
/** 박스 앞쪽(+Z) 정면 스탠드오프 */
const BOX_APPROACH_Z = 1.75;

/** 흘러가는 레일 슬랫 */
const RAIL_COUNT = 30;
const RAIL_SPACING = 0.45;
const BELT_MIN_X = -6.6;
const BELT_MAX_X = 6.6;
const railOffset = ref(0);

const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  railOffset.value = (railOffset.value + delta * 1.35) % RAIL_SPACING;
});

/**
 * 스크롤 오프셋을 반영한 레일 X 좌표 목록을 만든다.
 * @returns {number[]} 레일 X 위치
 */
const flowingRails = computed(() => {
  const span = RAIL_COUNT * RAIL_SPACING;
  const xs: number[] = [];
  for (let i = 0; i < RAIL_COUNT; i++) {
    let x = BELT_MIN_X + i * RAIL_SPACING + railOffset.value;
    if (x > BELT_MAX_X) x -= span;
    xs.push(x);
  }
  return xs;
});

const boxes = computed(() => {
  const list = props.projects.slice(0, 6);
  // 콘솔(x≈8.2)과 가깝게 벨트 우측에 정렬
  const gap = 2.22;
  const rightmostX = 6.4;
  const startX = rightmostX - Math.max(0, list.length - 1) * gap;
  return list.map((project, index) => ({
    id: `box-${index}-${project.url}`,
    project,
    x: startX + index * gap,
    y: 1.15,
    z: CONVEYOR_POSITION.z,
  }));
});

const cardboardMap = shallowRef<Texture | null>(null);
const labelMap = shallowRef<Texture | null>(null);
const panelMap = shallowRef<Texture | null>(null);
const ready = ref(false);

onMounted(() => {
  cardboardMap.value = createCardboardTexture();
  labelMap.value = createLabelTexture();
  panelMap.value = createPanelTexture();
  ready.value = true;
});

onBeforeUnmount(() => {
  cardboardMap.value?.dispose();
  labelMap.value?.dispose();
  panelMap.value?.dispose();
  document.body.style.cursor = "";
});

watch(
  boxes,
  (list) => {
    scene.portfolioBoxes.value = list.map((b) => ({
      id: b.id,
      x: b.x,
      y: b.y + 0.55,
      z: b.z,
      project: b.project,
    }));
  },
  { immediate: true, deep: true },
);

/**
 * 박스와 플레이어 거리를 계산한다.
 * @param {number} x - 박스 X
 * @param {number} z - 박스 Z
 * @returns {number} 거리
 */
function distanceToPlayer(x: number, z: number): number {
  const dx = scene.playerPos.value.x - x;
  const dz = scene.playerPos.value.z - z;
  return Math.hypot(dx, dz);
}

watchEffect(() => {
  let nearest: (typeof boxes.value)[number] | null = null;
  let min = Infinity;
  for (const box of boxes.value) {
    const d = distanceToPlayer(box.x, box.z);
    if (d < min) {
      min = d;
      nearest = box;
    }
  }
  scene.focusedProject.value = nearest && min < 2.2 ? nearest.project : null;
});

/**
 * 박스 호버 시작
 * @param {string} id - 박스 id
 */
function handleBoxEnter(id: string) {
  hoveredId.value = id;
  document.body.style.cursor = "pointer";
}

/**
 * 박스 호버 종료
 * @param {string} id - 박스 id
 */
function handleBoxLeave(id: string) {
  if (hoveredId.value === id) {
    hoveredId.value = null;
    document.body.style.cursor = "";
  }
}

/**
 * 박스 클릭 시 캐릭터를 박스 앞으로 이동시킨다.
 * @param {object} box - 박스 데이터
 * @param {string} box.id - id
 * @param {number} box.x - x
 * @param {number} box.z - z
 * @param {ProjectItem} box.project - 프로젝트
 * @param {Event} [event] - 포인터 이벤트
 */
function handleBoxClick(
  box: { id: string; x: number; z: number; project: ProjectItem },
  event?: Event,
) {
  if (event && "stopPropagation" in event) {
    (event as Event).stopPropagation();
  }
  scene.focusedProject.value = box.project;
  scene.setMoveTarget(box.x, box.z + BOX_APPROACH_Z);
}
</script>

<template>
  <TresGroup v-if="ready" :position="[CONVEYOR_POSITION.x, 0, CONVEYOR_POSITION.z]">
    <!-- 프레임 본체 -->
    <TresMesh :position="[0, 0.45, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[14.0, 0.5, 1.55]" />
      <TresMeshStandardMaterial :map="panelMap" :flat-shading="true" metalness="0.45" roughness="0.5" />
    </TresMesh>

    <!-- 벨트 바닥 -->
    <TresMesh :position="[0, 0.74, 0]" receive-shadow>
      <TresBoxGeometry :args="[13.2, 0.06, 1.15]" />
      <TresMeshStandardMaterial color="#1e242c" :flat-shading="true" metalness="0.2" roughness="0.85" />
    </TresMesh>

    <!-- 고정 사이드 레일 -->
    <TresMesh :position="[0, 0.92, 0.58]" cast-shadow>
      <TresBoxGeometry :args="[13.3, 0.16, 0.08]" />
      <TresMeshStandardMaterial color="#8a94a4" :flat-shading="true" metalness="0.55" roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[0, 0.92, -0.58]" cast-shadow>
      <TresBoxGeometry :args="[13.3, 0.16, 0.08]" />
      <TresMeshStandardMaterial color="#8a94a4" :flat-shading="true" metalness="0.55" roughness="0.4" />
    </TresMesh>

    <!-- 흘러가는 크로스 레일 (박스는 별도 고정) -->
    <TresMesh
      v-for="(rx, i) in flowingRails"
      :key="`rail-${i}`"
      :position="[rx, 0.8, 0]"
      cast-shadow
    >
      <TresBoxGeometry :args="[0.1, 0.08, 1.05]" />
      <TresMeshStandardMaterial color="#9aa4b4" :flat-shading="true" metalness="0.6" roughness="0.35" />
    </TresMesh>

    <TresGroup :position="[-7.1, 0.55, 0]">
      <TresMesh cast-shadow>
        <TresBoxGeometry :args="[0.4, 1.0, 1.0]" />
        <TresMeshStandardMaterial color="#7a8494" :flat-shading="true" metalness="0.6" roughness="0.35" />
      </TresMesh>
      <TresMesh :rotation="[0, 0, Math.PI / 4]" cast-shadow>
        <TresBoxGeometry :args="[0.42, 0.7, 0.7]" />
        <TresMeshStandardMaterial color="#9aa4b4" :flat-shading="true" metalness="0.65" roughness="0.3" />
      </TresMesh>
    </TresGroup>
    <TresGroup :position="[7.1, 0.55, 0]">
      <TresMesh cast-shadow>
        <TresBoxGeometry :args="[0.4, 1.0, 1.0]" />
        <TresMeshStandardMaterial color="#7a8494" :flat-shading="true" metalness="0.6" roughness="0.35" />
      </TresMesh>
      <TresMesh :rotation="[0, 0, Math.PI / 4]" cast-shadow>
        <TresBoxGeometry :args="[0.42, 0.7, 0.7]" />
        <TresMeshStandardMaterial color="#9aa4b4" :flat-shading="true" metalness="0.65" roughness="0.3" />
      </TresMesh>
    </TresGroup>

    <TresMesh v-for="lx in [-5.5, -2.2, 1.1, 4.4]" :key="`leg-${lx}`" :position="[lx, 0.22, 0.55]" cast-shadow>
      <TresBoxGeometry :args="[0.2, 0.44, 0.2]" />
      <TresMeshStandardMaterial color="#5a6574" :flat-shading="true" metalness="0.45" roughness="0.5" />
    </TresMesh>
    <TresMesh v-for="lx in [-5.5, -2.2, 1.1, 4.4]" :key="`legb-${lx}`" :position="[lx, 0.22, -0.55]" cast-shadow>
      <TresBoxGeometry :args="[0.2, 0.44, 0.2]" />
      <TresMeshStandardMaterial color="#5a6574" :flat-shading="true" metalness="0.45" roughness="0.5" />
    </TresMesh>
  </TresGroup>

  <template v-if="ready">
    <TresGroup
      v-for="box in boxes"
      :key="box.id"
      :position="[box.x, box.y, box.z]"
      @pointerenter="handleBoxEnter(box.id)"
      @pointerleave="handleBoxLeave(box.id)"
      @click="handleBoxClick(box, $event)"
    >
      <!-- Neon outline (hover) -->
      <TresMesh v-if="hoveredId === box.id" :scale="[1.12, 1.14, 1.12]">
        <TresBoxGeometry :args="[0.95, 0.85, 0.95]" />
        <TresMeshBasicMaterial
          color="#7dffd0"
          wireframe
          :transparent="true"
          :opacity="0.95"
        />
      </TresMesh>
      <TresMesh v-if="hoveredId === box.id" :scale="[1.06, 1.08, 1.06]">
        <TresBoxGeometry :args="[0.95, 0.85, 0.95]" />
        <TresMeshBasicMaterial
          color="#9effe8"
          :transparent="true"
          :opacity="0.12"
          :depth-write="false"
        />
      </TresMesh>

      <TresMesh cast-shadow>
        <TresBoxGeometry :args="[0.95, 0.85, 0.95]" />
        <TresMeshStandardMaterial
          :map="cardboardMap"
          :flat-shading="true"
          roughness="0.9"
          :emissive="hoveredId === box.id ? '#2a6655' : '#000000'"
          :emissive-intensity="hoveredId === box.id ? 0.35 : 0"
        />
      </TresMesh>
      <TresMesh :position="[0, 0.44, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.98, 0.08, 0.98]" />
        <TresMeshStandardMaterial color="#d4b070" :flat-shading="true" roughness="0.85" />
      </TresMesh>
      <TresMesh :position="[0, 0.05, 0.48]">
        <TresPlaneGeometry :args="[0.55, 0.4]" />
        <TresMeshStandardMaterial :map="labelMap" :flat-shading="true" roughness="1" />
      </TresMesh>
    </TresGroup>
  </template>
</template>
