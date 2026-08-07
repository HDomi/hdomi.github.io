<script setup lang="ts">
import { useLoop, useTres } from "@tresjs/core";
import type { PerspectiveCamera } from "three";
import { Vector3 } from "three";
import {
  boxCollidersFromMarkers,
  CONSOLE_POSITION,
  resolveMove,
  useFactoryScene,
} from "~/composables/useFactoryScene";

interface Props {
  cameraDistance: number;
  cameraFov: number;
}

const props = defineProps<Props>();
const scene = useFactoryScene();
const { camera } = useTres();
const { onBeforeRender } = useLoop();

const keys = reactive({
  w: false,
  a: false,
  s: false,
  d: false,
});

const facing = ref(0);
const walkPhase = ref(0);
const isMoving = ref(false);
const limb = reactive({
  leftLeg: 0,
  rightLeg: 0,
  leftArm: 0,
  rightArm: 0,
  bob: 0,
});

const SPEED = 4.2;
const WALK_SPEED = 9.5;
const tmpCamPos = new Vector3();
const tmpLook = new Vector3();

/**
 * 물리 키 코드로 이동 입력을 반영한다. (한영 전환과 무관)
 * @param {string} code - KeyboardEvent.code
 * @param {boolean} pressed - 눌림 여부
 */
function setKeyByCode(code: string, pressed: boolean) {
  switch (code) {
    case "KeyW":
    case "ArrowUp":
      keys.w = pressed;
      break;
    case "KeyA":
    case "ArrowLeft":
      keys.a = pressed;
      break;
    case "KeyS":
    case "ArrowDown":
      keys.s = pressed;
      break;
    case "KeyD":
    case "ArrowRight":
      keys.d = pressed;
      break;
    default:
      break;
  }
}

/**
 * 게임 조작 키인지 판별한다.
 * @param {string} code - KeyboardEvent.code
 * @returns {boolean} 조작 키 여부
 */
function isGameplayCode(code: string): boolean {
  return (
    code === "KeyW" ||
    code === "KeyA" ||
    code === "KeyS" ||
    code === "KeyD" ||
    code === "KeyE" ||
    code === "ArrowUp" ||
    code === "ArrowDown" ||
    code === "ArrowLeft" ||
    code === "ArrowRight" ||
    code === "Escape"
  );
}

/**
 * 키다운 핸들러
 * @param {KeyboardEvent} e - 키보드 이벤트
 */
function onKeyDown(e: KeyboardEvent) {
  if (e.code === "Escape") {
    e.preventDefault();
    scene.closeOverlay();
    return;
  }

  // 오버레이 입력(챗봇 등) 중에는 WASD 캡처하지 않음
  if (scene.cameraMode.value !== "third") return;

  if (isGameplayCode(e.code)) e.preventDefault();
  setKeyByCode(e.code, true);
  if (e.code === "KeyE" && scene.nearbyConsole.value) scene.openConsole();
  if (e.code === "KeyE" && scene.nearbyInfoBoard.value) scene.openInfoBoard();
  if (e.code === "KeyE" && scene.nearbyTablet.value) scene.openTablet();
}

/**
 * 키업 핸들러
 * @param {KeyboardEvent} e - 키보드 이벤트
 */
function onKeyUp(e: KeyboardEvent) {
  if (scene.cameraMode.value !== "third") {
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;
    return;
  }
  if (isGameplayCode(e.code)) e.preventDefault();
  setKeyByCode(e.code, false);
}

/**
 * 걷기 모션을 갱신한다.
 * @param {number} delta - 프레임 델타
 * @param {boolean} moving - 이동 중 여부
 */
function updateWalkCycle(delta: number, moving: boolean) {
  isMoving.value = moving;
  if (moving) {
    walkPhase.value += delta * WALK_SPEED;
    const swing = Math.sin(walkPhase.value);
    limb.leftLeg = swing * 0.7;
    limb.rightLeg = -swing * 0.7;
    limb.leftArm = -swing * 0.55;
    limb.rightArm = swing * 0.55;
    limb.bob = Math.abs(Math.sin(walkPhase.value * 2)) * 0.04;
  } else {
    // idle로 부드럽게 복귀
    const ease = 1 - Math.exp(-10 * delta);
    limb.leftLeg += (0 - limb.leftLeg) * ease;
    limb.rightLeg += (0 - limb.rightLeg) * ease;
    limb.leftArm += (0 - limb.leftArm) * ease;
    limb.rightArm += (0 - limb.rightArm) * ease;
    limb.bob += (0 - limb.bob) * ease;
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown, true);
  window.removeEventListener("keyup", onKeyUp, true);
});

onBeforeRender(({ delta }) => {
  if (scene.cameraMode.value === "console") {
    updateWalkCycle(delta, false);
    const cam = camera.value as PerspectiveCamera | undefined;
    if (cam) {
      cam.fov = 40;
      cam.updateProjectionMatrix();
      cam.position.lerp(
        tmpCamPos.set(CONSOLE_POSITION.x, 1.55, CONSOLE_POSITION.z + 1.35),
        1 - Math.exp(-6 * delta),
      );
      cam.lookAt(CONSOLE_POSITION.x, 1.45, CONSOLE_POSITION.z);
    }
    return;
  }

  if (scene.cameraMode.value === "board" || scene.cameraMode.value === "tablet") {
    updateWalkCycle(delta, false);
    return;
  }

  let mx = 0;
  let mz = 0;

  if (keys.w) mz -= 1;
  if (keys.s) mz += 1;
  if (keys.a) mx -= 1;
  if (keys.d) mx += 1;

  mx += scene.joystick.value.x;
  mz += scene.joystick.value.y;

  const target = scene.moveTarget.value;
  if (target && Math.abs(mx) < 0.05 && Math.abs(mz) < 0.05) {
    const dx = target.x - scene.playerPos.value.x;
    const dz = target.z - scene.playerPos.value.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.12) {
      scene.moveTarget.value = null;
    } else {
      mx = dx / dist;
      mz = dz / dist;
    }
  }

  const len = Math.hypot(mx, mz);
  const moving = len > 0.01;
  if (moving) {
    mx /= len;
    mz /= len;
    const dynamic = boxCollidersFromMarkers(scene.portfolioBoxes.value);
    scene.playerPos.value = resolveMove(
      scene.playerPos.value.x,
      scene.playerPos.value.z,
      mx * SPEED * delta,
      mz * SPEED * delta,
      dynamic,
    );
    facing.value = Math.atan2(mx, mz);
  }
  updateWalkCycle(delta, moving);

  const cam = camera.value as PerspectiveCamera | undefined;
  if (cam) {
    cam.fov = props.cameraFov;
    cam.updateProjectionMatrix();
    const dist = props.cameraDistance;
    const camX = Math.max(-4.5, Math.min(4.5, scene.playerPos.value.x * 0.45));
    const desired = tmpCamPos.set(
      camX,
      dist * 0.46,
      scene.playerPos.value.z + dist * 0.82,
    );
    cam.position.lerp(desired, 1 - Math.exp(-4 * delta));
    cam.lookAt(tmpLook.set(scene.playerPos.value.x, 0.72, scene.playerPos.value.z - 0.8));
  }
});

/** 발 바닥이 지면(y=0)에 묻히지 않도록 소폭 오프셋 */
const FOOT_CLEARANCE = 0.05;

const playerPosition = computed(
  () =>
    [
      scene.playerPos.value.x,
      FOOT_CLEARANCE + limb.bob,
      scene.playerPos.value.z,
    ] as [number, number, number],
);
</script>

<template>
  <TresGroup :position="playerPosition" :rotation="[0, facing, 0]">
    <!-- SD 주황 티셔츠 -->
    <TresMesh :position="[0, 0.62, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.4, 0.28, 0.26]" />
      <TresMeshStandardMaterial color="#ff7a2f" :flat-shading="true" roughness="0.72" />
    </TresMesh>

    <!-- 청 멜빵 바디/힙 -->
    <TresMesh :position="[0, 0.44, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.42, 0.2, 0.28]" />
      <TresMeshStandardMaterial color="#3b6eb8" :flat-shading="true" roughness="0.78" />
    </TresMesh>
    <!-- 멜빵 앞판 -->
    <TresMesh :position="[0, 0.66, 0.12]" cast-shadow>
      <TresBoxGeometry :args="[0.26, 0.2, 0.06]" />
      <TresMeshStandardMaterial color="#2f5fa6" :flat-shading="true" roughness="0.75" />
    </TresMesh>
    <!-- 멜빵 끈 -->
    <TresMesh :position="[-0.1, 0.78, 0.08]" cast-shadow>
      <TresBoxGeometry :args="[0.055, 0.26, 0.04]" />
      <TresMeshStandardMaterial color="#2a5494" :flat-shading="true" roughness="0.75" />
    </TresMesh>
    <TresMesh :position="[0.1, 0.78, 0.08]" cast-shadow>
      <TresBoxGeometry :args="[0.055, 0.26, 0.04]" />
      <TresMeshStandardMaterial color="#2a5494" :flat-shading="true" roughness="0.75" />
    </TresMesh>
    <!-- 멜빵 버클 -->
    <TresMesh :position="[0, 0.62, 0.155]">
      <TresBoxGeometry :args="[0.08, 0.06, 0.03]" />
      <TresMeshStandardMaterial color="#f0c040" :flat-shading="true" metalness="0.55" roughness="0.4" />
    </TresMesh>

    <!-- SD 큰 머리 -->
    <TresMesh :position="[0, 1.0, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.42, 0.42, 0.42]" />
      <TresMeshStandardMaterial color="#ffe0c2" :flat-shading="true" roughness="0.55" />
    </TresMesh>
    <TresMesh :position="[-0.1, 1.02, 0.22]">
      <TresBoxGeometry :args="[0.09, 0.09, 0.05]" />
      <TresMeshStandardMaterial color="#1a1a1a" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[0.1, 1.02, 0.22]">
      <TresBoxGeometry :args="[0.09, 0.09, 0.05]" />
      <TresMeshStandardMaterial color="#1a1a1a" :flat-shading="true" />
    </TresMesh>

    <!-- 노란 안전모 -->
    <TresMesh :position="[0, 1.26, -0.01]" cast-shadow>
      <TresBoxGeometry :args="[0.48, 0.16, 0.48]" />
      <TresMeshStandardMaterial color="#ffd400" :flat-shading="true" roughness="0.45" />
    </TresMesh>
    <TresMesh :position="[0, 1.16, 0.04]" cast-shadow>
      <TresBoxGeometry :args="[0.54, 0.06, 0.56]" />
      <TresMeshStandardMaterial color="#f0c200" :flat-shading="true" roughness="0.5" />
    </TresMesh>
    <TresMesh :position="[0, 1.28, 0.24]">
      <TresBoxGeometry :args="[0.12, 0.05, 0.04]" />
      <TresMeshStandardMaterial color="#e8b000" :flat-shading="true" roughness="0.5" />
    </TresMesh>

    <!-- 왼팔 (주황 소매) -->
    <TresGroup :position="[-0.28, 0.7, 0]" :rotation="[limb.leftArm, 0, 0.18]">
      <TresMesh :position="[0, -0.12, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.14, 0.24, 0.14]" />
        <TresMeshStandardMaterial color="#ff7a2f" :flat-shading="true" roughness="0.72" />
      </TresMesh>
      <TresGroup :position="[0, -0.24, 0]" :rotation="[limb.leftArm * 0.35, 0, 0]">
        <TresMesh :position="[0, -0.1, 0]" cast-shadow>
          <TresBoxGeometry :args="[0.12, 0.2, 0.12]" />
          <TresMeshStandardMaterial color="#ffe0c2" :flat-shading="true" roughness="0.6" />
        </TresMesh>
        <TresMesh :position="[0, -0.22, 0.01]" cast-shadow>
          <TresBoxGeometry :args="[0.13, 0.1, 0.13]" />
          <TresMeshStandardMaterial color="#ffd4b0" :flat-shading="true" roughness="0.6" />
        </TresMesh>
      </TresGroup>
    </TresGroup>

    <!-- 오른팔 -->
    <TresGroup :position="[0.28, 0.7, 0]" :rotation="[limb.rightArm, 0, -0.18]">
      <TresMesh :position="[0, -0.12, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.14, 0.24, 0.14]" />
        <TresMeshStandardMaterial color="#ff7a2f" :flat-shading="true" roughness="0.72" />
      </TresMesh>
      <TresGroup :position="[0, -0.24, 0]" :rotation="[limb.rightArm * 0.35, 0, 0]">
        <TresMesh :position="[0, -0.1, 0]" cast-shadow>
          <TresBoxGeometry :args="[0.12, 0.2, 0.12]" />
          <TresMeshStandardMaterial color="#ffe0c2" :flat-shading="true" roughness="0.6" />
        </TresMesh>
        <TresMesh :position="[0, -0.22, 0.01]" cast-shadow>
          <TresBoxGeometry :args="[0.13, 0.1, 0.13]" />
          <TresMeshStandardMaterial color="#ffd4b0" :flat-shading="true" roughness="0.6" />
        </TresMesh>
      </TresGroup>
    </TresGroup>

    <!--
      다리 체인: hip(0.42) → lower(-0.22) → boot(-0.155,h0.1)
      발바닥 로컬 y = 0.42 - 0.22 - 0.155 - 0.05 = -0.005 ≈ 0 (+ clearance)
    -->
    <TresGroup :position="[-0.11, 0.42, 0]" :rotation="[limb.leftLeg, 0, 0]">
      <TresMesh :position="[0, -0.1, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.16, 0.2, 0.18]" />
        <TresMeshStandardMaterial color="#3b6eb8" :flat-shading="true" roughness="0.78" />
      </TresMesh>
      <TresGroup :position="[0, -0.22, 0]" :rotation="[Math.max(0, -limb.leftLeg) * 0.45, 0, 0]">
        <TresMesh :position="[0, -0.07, 0]" cast-shadow>
          <TresBoxGeometry :args="[0.15, 0.14, 0.17]" />
          <TresMeshStandardMaterial color="#2f5fa6" :flat-shading="true" roughness="0.78" />
        </TresMesh>
        <TresMesh :position="[0, -0.155, 0.03]" cast-shadow>
          <TresBoxGeometry :args="[0.17, 0.1, 0.24]" />
          <TresMeshStandardMaterial color="#1a1c20" :flat-shading="true" roughness="0.85" />
        </TresMesh>
      </TresGroup>
    </TresGroup>

    <TresGroup :position="[0.11, 0.42, 0]" :rotation="[limb.rightLeg, 0, 0]">
      <TresMesh :position="[0, -0.1, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.16, 0.2, 0.18]" />
        <TresMeshStandardMaterial color="#3b6eb8" :flat-shading="true" roughness="0.78" />
      </TresMesh>
      <TresGroup :position="[0, -0.22, 0]" :rotation="[Math.max(0, -limb.rightLeg) * 0.45, 0, 0]">
        <TresMesh :position="[0, -0.07, 0]" cast-shadow>
          <TresBoxGeometry :args="[0.15, 0.14, 0.17]" />
          <TresMeshStandardMaterial color="#2f5fa6" :flat-shading="true" roughness="0.78" />
        </TresMesh>
        <TresMesh :position="[0, -0.155, 0.03]" cast-shadow>
          <TresBoxGeometry :args="[0.17, 0.1, 0.24]" />
          <TresMeshStandardMaterial color="#1a1c20" :flat-shading="true" roughness="0.85" />
        </TresMesh>
      </TresGroup>
    </TresGroup>
  </TresGroup>
</template>
