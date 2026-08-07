<script setup lang="ts">
import { useLoop } from "@tresjs/core";
import type { Texture } from "three";
import {
  createBrickTexture,
  createGrateTexture,
  createHazardTexture,
  createPanelTexture,
  createSoftFloorTexture,
} from "~/utils/pixelTextures";

const grateTiles = [
  { x: -5, z: 2 },
  { x: 4, z: 4 },
  { x: -2, z: 6 },
  { x: 2, z: -1 },
];

const wallLamps = [
  { x: -11.75, y: 3.4, z: -5 },
  { x: -11.75, y: 3.4, z: 0 },
  { x: -11.75, y: 3.4, z: 5 },
  { x: 11.75, y: 3.4, z: -3 },
  { x: 11.75, y: 3.4, z: 3 },
];

const overheadLights = [
  { x: -5, z: 1 },
  { x: 0, z: 1 },
  { x: 5, z: 1 },
  { x: -5, z: 5 },
  { x: 5, z: 5 },
  { x: 0, z: -2 },
];

const hazardPosts = [
  { x: -8.8, z: 7.2 },
  { x: 8.8, z: 7.2 },
  { x: -8.8, z: -1.7 },
];

const southBollards = [-9.1, -4.5, 0, 4.5, 9.1];

const brickRows = [-5.2, -3.2, -1.2, 0.8, 2.8, 4.8, 6.6];

const brickMap = shallowRef<Texture | null>(null);
const floorMap = shallowRef<Texture | null>(null);
const grateMap = shallowRef<Texture | null>(null);
const hazardMap = shallowRef<Texture | null>(null);
const panelMap = shallowRef<Texture | null>(null);
const ready = ref(false);

const flamePulse = ref(2.6);
const flameLight = ref(5.8);
const warnBlink = ref(1);
const fanAngle = ref(0);
const screenFlicker = ref(1.8);
const screenFlickerB = ref(1.2);
const lampBreath = ref(2.4);
const overheadBreath = ref(3.4);
const dialPulse = ref(1);

const { onBeforeRender } = useLoop();

onBeforeRender(({ elapsed }) => {
  flamePulse.value = 2.2 + Math.sin(elapsed * 7.5) * 0.55 + Math.sin(elapsed * 13) * 0.2;
  flameLight.value = 5.2 + Math.sin(elapsed * 6.2) * 1.4;
  warnBlink.value = Math.sin(elapsed * 5) > 0 ? 1.4 : 0.15;
  fanAngle.value = elapsed * 4.5;
  screenFlicker.value = 1.4 + Math.sin(elapsed * 2.2) * 0.45 + (Math.sin(elapsed * 17) > 0.92 ? 0.5 : 0);
  screenFlickerB.value = 1.0 + Math.sin(elapsed * 1.6 + 1.2) * 0.35;
  lampBreath.value = 2.15 + Math.sin(elapsed * 1.1) * 0.35;
  overheadBreath.value = 3.1 + Math.sin(elapsed * 0.85) * 0.35;
  dialPulse.value = 0.75 + Math.abs(Math.sin(elapsed * 3.2)) * 0.55;
});

onMounted(() => {
  brickMap.value = createBrickTexture(14, 6);
  floorMap.value = createSoftFloorTexture(128, 6, 5);
  grateMap.value = createGrateTexture();
  hazardMap.value = createHazardTexture();
  panelMap.value = createPanelTexture();
  ready.value = true;
});

onBeforeUnmount(() => {
  brickMap.value?.dispose();
  floorMap.value?.dispose();
  grateMap.value?.dispose();
  hazardMap.value?.dispose();
  panelMap.value?.dispose();
});
</script>

<template>
  <TresGroup v-if="ready">
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, 0]" receive-shadow name="floor">
      <TresPlaneGeometry :args="[24, 20]" />
      <TresMeshStandardMaterial
        :map="floorMap"
        :flat-shading="true"
        roughness="0.78"
        metalness="0.28"
      />
    </TresMesh>

    <TresMesh
      v-for="(tile, i) in grateTiles"
      :key="`grate-${i}`"
      :rotation="[-Math.PI / 2, 0, 0]"
      :position="[tile.x, 0.012, tile.z]"
      receive-shadow
    >
      <TresPlaneGeometry :args="[1.6, 1.6]" />
      <TresMeshStandardMaterial :map="grateMap" :flat-shading="true" roughness="0.88" metalness="0.4" :opacity="0.92" transparent />
    </TresMesh>

    <!-- Hazard stripes -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.014, -4.35]" receive-shadow>
      <TresPlaneGeometry :args="[16, 0.28]" />
      <TresMeshStandardMaterial :map="hazardMap" :flat-shading="true" roughness="0.75" :opacity="0.85" transparent />
    </TresMesh>
    <TresMesh :rotation="[-Math.PI / 2, 0, Math.PI / 2]" :position="[-9.6, 0.014, 1]" receive-shadow>
      <TresPlaneGeometry :args="[12, 0.22]" />
      <TresMeshStandardMaterial :map="hazardMap" :flat-shading="true" roughness="0.75" :opacity="0.7" transparent />
    </TresMesh>
    <TresMesh :rotation="[-Math.PI / 2, 0, Math.PI / 2]" :position="[9.6, 0.014, 1]" receive-shadow>
      <TresPlaneGeometry :args="[12, 0.22]" />
      <TresMeshStandardMaterial :map="hazardMap" :flat-shading="true" roughness="0.75" :opacity="0.7" transparent />
    </TresMesh>
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.014, 7.85]" receive-shadow>
      <TresPlaneGeometry :args="[18, 0.22]" />
      <TresMeshStandardMaterial :map="hazardMap" :flat-shading="true" roughness="0.75" :opacity="0.75" transparent />
    </TresMesh>

    <!-- Brick walls -->
    <TresMesh :position="[0, 4, -10]" receive-shadow cast-shadow>
      <TresBoxGeometry :args="[24, 8, 0.45]" />
      <TresMeshStandardMaterial :map="brickMap" :flat-shading="true" roughness="0.92" />
    </TresMesh>
    <TresMesh :position="[-12, 4, 0]" receive-shadow cast-shadow>
      <TresBoxGeometry :args="[0.45, 8, 20]" />
      <TresMeshStandardMaterial :map="brickMap" :flat-shading="true" roughness="0.92" />
    </TresMesh>
    <TresMesh :position="[12, 4, 0]" receive-shadow cast-shadow>
      <TresBoxGeometry :args="[0.45, 8, 20]" />
      <TresMeshStandardMaterial :map="brickMap" :flat-shading="true" roughness="0.92" />
    </TresMesh>

    <TresMesh
      v-for="(y, i) in brickRows"
      :key="`ledge-${i}`"
      :position="[0, y, -9.72]"
      cast-shadow
    >
      <TresBoxGeometry :args="[23.6, 0.12, 0.16]" />
      <TresMeshStandardMaterial color="#3a4250" :flat-shading="true" roughness="0.9" />
    </TresMesh>

    <TresMesh :position="[0, 4, 0]">
      <TresBoxGeometry :args="[80, 28, 80]" />
      <TresMeshStandardMaterial color="#3a4250" :side="1" :roughness="1" :metalness="0" />
    </TresMesh>

    <TresMesh :position="[0, 0.25, -9.75]" cast-shadow>
      <TresBoxGeometry :args="[23.4, 0.5, 0.18]" />
      <TresMeshStandardMaterial :map="panelMap" :flat-shading="true" metalness="0.4" roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[-11.75, 0.25, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.18, 0.5, 19.2]" />
      <TresMeshStandardMaterial :map="panelMap" :flat-shading="true" metalness="0.4" roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[11.75, 0.25, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.18, 0.5, 19.2]" />
      <TresMeshStandardMaterial :map="panelMap" :flat-shading="true" metalness="0.4" roughness="0.5" />
    </TresMesh>

    <!-- 남측 낮은 안전 레일 + 볼라드 (카메라 시야 가리지 않음) -->
    <TresMesh :position="[0, 0.35, 8.05]" cast-shadow>
      <TresBoxGeometry :args="[18.5, 0.12, 0.12]" />
      <TresMeshStandardMaterial color="#8a94a4" :flat-shading="true" metalness="0.55" roughness="0.4" />
    </TresMesh>
    <TresMesh
      v-for="(bx, i) in southBollards"
      :key="`bollard-${i}`"
      :position="[bx, 0.45, 8.05]"
      cast-shadow
    >
      <TresBoxGeometry :args="[0.22, 0.9, 0.22]" />
      <TresMeshStandardMaterial color="#f0c000" :flat-shading="true" roughness="0.55" />
    </TresMesh>

    <!-- Left machinery -->
    <TresGroup :position="[-8.7, 0, -7.9]">
      <TresMesh :position="[0, 1.4, 0]" cast-shadow>
        <TresBoxGeometry :args="[2.4, 2.8, 1.6]" />
        <TresMeshStandardMaterial :map="panelMap" :flat-shading="true" metalness="0.45" roughness="0.45" />
      </TresMesh>
      <TresMesh :position="[0.2, 1.6, 0.82]">
        <TresBoxGeometry :args="[1.2, 0.9, 0.08]" />
        <TresMeshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          :emissive-intensity="screenFlicker"
          :flat-shading="true"
        />
      </TresMesh>
      <TresMesh v-for="(dx, i) in [-0.35, 0, 0.35]" :key="`dial-${i}`" :position="[dx, 0.95, 0.82]">
        <TresBoxGeometry :args="[0.22, 0.22, 0.06]" />
        <TresMeshStandardMaterial
          :color="i === 1 ? '#39ff14' : '#ffcc33'"
          :emissive="i === 1 ? '#22aa00' : '#bb8800'"
          :emissive-intensity="dialPulse"
          :flat-shading="true"
        />
      </TresMesh>
      <TresMesh :position="[-0.9, 2.6, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.28, 2.2, 0.28]" />
        <TresMeshStandardMaterial color="#7a8494" :flat-shading="true" metalness="0.6" roughness="0.4" />
      </TresMesh>
      <TresMesh :position="[0.9, 2.8, -0.2]" cast-shadow>
        <TresBoxGeometry :args="[2.4, 0.24, 0.24]" />
        <TresMeshStandardMaterial color="#7a8494" :flat-shading="true" metalness="0.6" roughness="0.4" />
      </TresMesh>
      <TresMesh :position="[1.1, 0.45, 0.9]" cast-shadow>
        <TresBoxGeometry :args="[0.55, 0.9, 0.45]" />
        <TresMeshStandardMaterial color="#586070" :flat-shading="true" metalness="0.45" roughness="0.45" />
      </TresMesh>
    </TresGroup>

    <!-- Wall screens (flicker) -->
    <TresMesh :position="[-11.7, 2.4, -3]">
      <TresBoxGeometry :args="[0.1, 0.7, 1.1]" />
      <TresMeshStandardMaterial
        color="#00c8ff"
        emissive="#00c8ff"
        :emissive-intensity="screenFlicker"
        :flat-shading="true"
      />
    </TresMesh>
    <TresMesh :position="[-11.7, 3.5, 4.2]">
      <TresBoxGeometry :args="[0.1, 0.5, 0.9]" />
      <TresMeshStandardMaterial
        color="#39ff14"
        emissive="#39ff14"
        :emissive-intensity="dialPulse"
        :flat-shading="true"
      />
    </TresMesh>
    <TresMesh :position="[11.7, 2.6, -0.5]">
      <TresBoxGeometry :args="[0.1, 1.1, 1.6]" />
      <TresMeshStandardMaterial
        color="#7dffb0"
        emissive="#2dff8a"
        :emissive-intensity="screenFlickerB"
        :flat-shading="true"
      />
    </TresMesh>

    <TresGroup v-for="(lamp, i) in wallLamps" :key="`lamp-${i}`" :position="[lamp.x, lamp.y, lamp.z]">
      <TresMesh>
        <TresBoxGeometry :args="[0.2, 0.24, 0.6]" />
        <TresMeshStandardMaterial
          color="#fff4d0"
          emissive="#ffe9a8"
          :emissive-intensity="lampBreath * 0.55"
          :flat-shading="true"
        />
      </TresMesh>
      <TresPointLight
        :position="[lamp.x > 0 ? -0.3 : 0.3, -0.2, 0]"
        color="#fff1c9"
        :intensity="lampBreath"
        :distance="9"
      />
    </TresGroup>

    <!-- Fire alcove (pulse) -->
    <TresGroup :position="[9.5, 0, -7.6]">
      <TresMesh :position="[0, 1.1, 0]" cast-shadow>
        <TresBoxGeometry :args="[1.6, 2.2, 1.4]" />
        <TresMeshStandardMaterial :map="panelMap" :flat-shading="true" roughness="0.85" />
      </TresMesh>
      <TresMesh :position="[0, 0.55, 0.3]">
        <TresBoxGeometry :args="[0.7, 0.9, 0.4]" />
        <TresMeshStandardMaterial
          color="#ff6a00"
          emissive="#ff4500"
          :emissive-intensity="flamePulse"
          :flat-shading="true"
        />
      </TresMesh>
      <TresMesh :position="[0, 0.95, 0.35]">
        <TresBoxGeometry :args="[0.35, 0.45, 0.2]" />
        <TresMeshStandardMaterial
          color="#ffcc66"
          emissive="#ffaa33"
          :emissive-intensity="flamePulse * 0.85"
          :flat-shading="true"
        />
      </TresMesh>
      <TresPointLight :position="[0, 1, 0.5]" color="#ff6a22" :intensity="flameLight" :distance="12" />
    </TresGroup>

    <!-- Crates -->
    <TresMesh :position="[-2.9, 0.55, -8.0]" cast-shadow>
      <TresBoxGeometry :args="[1.1, 1.1, 1.1]" />
      <TresMeshStandardMaterial color="#8a5f38" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[-1.8, 0.55, -8.1]" cast-shadow>
      <TresBoxGeometry :args="[1, 1.1, 1]" />
      <TresMeshStandardMaterial color="#9a6b40" :flat-shading="true" roughness="0.85" />
    </TresMesh>
    <TresMesh :position="[-2.3, 1.5, -8.05]" cast-shadow>
      <TresBoxGeometry :args="[1, 0.9, 0.95]" />
      <TresMeshStandardMaterial color="#7a5230" :flat-shading="true" roughness="0.85" />
    </TresMesh>

    <!-- Barrels -->
    <TresMesh :position="[8.5, 0.55, 6.5]" cast-shadow>
      <TresBoxGeometry :args="[0.75, 1.1, 0.75]" />
      <TresMeshStandardMaterial color="#3f8fd6" :flat-shading="true" metalness="0.4" roughness="0.45" />
    </TresMesh>
    <TresMesh :position="[9.4, 0.55, 6.3]" cast-shadow>
      <TresBoxGeometry :args="[0.75, 1.1, 0.75]" />
      <TresMeshStandardMaterial color="#d65a3f" :flat-shading="true" metalness="0.4" roughness="0.45" />
    </TresMesh>

    <!-- Pallet stack -->
    <TresGroup :position="[4.1, 0, 6.3]">
      <TresMesh :position="[0, 0.12, 0]" cast-shadow>
        <TresBoxGeometry :args="[1.5, 0.18, 1.1]" />
        <TresMeshStandardMaterial color="#8a6238" :flat-shading="true" roughness="0.9" />
      </TresMesh>
      <TresMesh :position="[0, 0.45, 0]" cast-shadow>
        <TresBoxGeometry :args="[1.2, 0.55, 0.9]" />
        <TresMeshStandardMaterial color="#6a7280" :flat-shading="true" roughness="0.7" />
      </TresMesh>
      <TresMesh :position="[0, 0.85, 0]" cast-shadow>
        <TresBoxGeometry :args="[1.0, 0.35, 0.75]" />
        <TresMeshStandardMaterial color="#586070" :flat-shading="true" roughness="0.7" />
      </TresMesh>
    </TresGroup>

    <!-- Toolbox -->
    <TresGroup :position="[-6.0, 0, 5.5]">
      <TresMesh :position="[0, 0.35, 0]" cast-shadow>
        <TresBoxGeometry :args="[1.2, 0.7, 0.7]" />
        <TresMeshStandardMaterial color="#3d4a5a" :flat-shading="true" metalness="0.45" roughness="0.5" />
      </TresMesh>
      <TresMesh :position="[0, 0.72, 0]" cast-shadow>
        <TresBoxGeometry :args="[1.25, 0.12, 0.75]" />
        <TresMeshStandardMaterial color="#f0c000" :flat-shading="true" roughness="0.55" />
      </TresMesh>
    </TresGroup>

    <!-- Vent fan (spin) -->
    <TresGroup :position="[11.55, 3.8, 4.5]">
      <TresMesh>
        <TresBoxGeometry :args="[0.12, 0.9, 0.9]" />
        <TresMeshStandardMaterial color="#5a6574" :flat-shading="true" metalness="0.5" roughness="0.45" />
      </TresMesh>
      <TresMesh :position="[-0.08, 0, 0]" :rotation="[fanAngle, 0, 0]">
        <TresBoxGeometry :args="[0.06, 0.7, 0.12]" />
        <TresMeshStandardMaterial color="#9aa4b4" :flat-shading="true" metalness="0.6" roughness="0.35" />
      </TresMesh>
      <TresMesh :position="[-0.08, 0, 0]" :rotation="[fanAngle + Math.PI / 2, 0, 0]">
        <TresBoxGeometry :args="[0.06, 0.7, 0.12]" />
        <TresMeshStandardMaterial color="#9aa4b4" :flat-shading="true" metalness="0.6" roughness="0.35" />
      </TresMesh>
    </TresGroup>

    <TresGroup v-for="(post, i) in hazardPosts" :key="`post-${i}`" :position="[post.x, 0, post.z]">
      <TresMesh :position="[0, 0.55, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.16, 1.1, 0.16]" />
        <TresMeshStandardMaterial color="#f0c000" :flat-shading="true" roughness="0.6" />
      </TresMesh>
      <TresMesh :position="[0, 0.18, 0]">
        <TresBoxGeometry :args="[0.32, 0.14, 0.32]" />
        <TresMeshStandardMaterial color="#2a2f38" :flat-shading="true" roughness="0.75" />
      </TresMesh>
      <TresMesh :position="[0, 1.05, 0]">
        <TresBoxGeometry :args="[0.18, 0.18, 0.18]" />
        <TresMeshStandardMaterial
          color="#ff3344"
          emissive="#ff2233"
          :emissive-intensity="warnBlink"
          :flat-shading="true"
        />
      </TresMesh>
    </TresGroup>

    <!-- Wall pipes / cable trays -->
    <TresMesh :position="[-11.55, 4.6, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.28, 0.28, 16]" />
      <TresMeshStandardMaterial color="#8a95a5" :flat-shading="true" metalness="0.55" roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[11.55, 4.4, 1]" cast-shadow>
      <TresBoxGeometry :args="[0.22, 0.22, 14]" />
      <TresMeshStandardMaterial color="#7a8494" :flat-shading="true" metalness="0.55" roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[0, 4.7, -9.55]" cast-shadow>
      <TresBoxGeometry :args="[20, 0.28, 0.28]" />
      <TresMeshStandardMaterial color="#8a95a5" :flat-shading="true" metalness="0.55" roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[-6, 5.1, -9.55]" cast-shadow>
      <TresBoxGeometry :args="[0.35, 0.55, 0.35]" />
      <TresMeshStandardMaterial color="#6a7484" :flat-shading="true" metalness="0.5" roughness="0.45" />
    </TresMesh>
    <TresMesh :position="[5, 5.1, -9.55]" cast-shadow>
      <TresBoxGeometry :args="[0.35, 0.55, 0.35]" />
      <TresMeshStandardMaterial color="#6a7484" :flat-shading="true" metalness="0.5" roughness="0.45" />
    </TresMesh>
    <TresMesh :position="[0, 5.2, 0]" cast-shadow>
      <TresBoxGeometry :args="[14, 0.16, 0.5]" />
      <TresMeshStandardMaterial color="#5a6574" :flat-shading="true" metalness="0.4" roughness="0.55" />
    </TresMesh>

    <TresPointLight
      v-for="(light, i) in overheadLights"
      :key="`overhead-${i}`"
      :position="[light.x, 5.6, light.z]"
      color="#fff6e4"
      :intensity="overheadBreath"
      :distance="14"
    />

    <TresAmbientLight :intensity="0.7" color="#c5d0dc" />
    <TresHemisphereLight :args="['#dce6f2', '#4a5564', 0.45]" />
    <TresDirectionalLight :position="[6, 14, 8]" :intensity="1.05" color="#fff5e8" cast-shadow />
    <TresDirectionalLight :position="[-8, 9, -2]" :intensity="0.4" color="#9ecfff" />
    <TresPointLight :position="[-7, 2.6, -6.5]" color="#00e5ff" :intensity="4.6" :distance="14" />
    <TresPointLight :position="[0, 4.6, 3]" color="#fff2d8" :intensity="2.6" :distance="18" />

    <TresFog attach="fog" color="#3a4250" :near="18" :far="48" />
  </TresGroup>
</template>
