<script setup lang="ts">
import { useLoop, useTres } from "@tresjs/core";
import type { PerspectiveCamera } from "three";
import { Vector3 } from "three";
import {
  CONSOLE_POSITION,
  INFO_BOARD_POSITION,
  TABLET_POSITION,
  useFactoryScene,
} from "~/composables/useFactoryScene";

const scene = useFactoryScene();
const { camera, renderer, sizes } = useTres();
const { onBeforeRender } = useLoop();

const worldPos = new Vector3();
const projected = new Vector3();

/**
 * 월드 좌표를 씬 루트 기준 스크린 좌표로 변환한다.
 * @param {PerspectiveCamera} cam - 카메라
 * @param {number} width - 캔버스 너비
 * @param {number} height - 캔버스 높이
 * @param {DOMRect} rect - 캔버스 rect
 * @param {DOMRect} parentRect - 씬 루트 rect
 * @param {number} x - 월드 X
 * @param {number} y - 월드 Y
 * @param {number} z - 월드 Z
 * @returns {{ left: number; top: number; visible: boolean }} 스크린 좌표
 */
function projectToScreen(
  cam: PerspectiveCamera,
  width: number,
  height: number,
  rect: DOMRect,
  parentRect: DOMRect,
  x: number,
  y: number,
  z: number,
): { left: number; top: number; visible: boolean } {
  worldPos.set(x, y, z);
  projected.copy(worldPos).project(cam);

  const inFront = projected.z < 1;
  const onScreen =
    inFront &&
    projected.x >= -1.2 &&
    projected.x <= 1.2 &&
    projected.y >= -1.2 &&
    projected.y <= 1.2;

  const canvasX = ((projected.x + 1) / 2) * width + (rect.left - parentRect.left);
  const canvasY = ((1 - projected.y) / 2) * height + (rect.top - parentRect.top);

  return {
    left: canvasX,
    top: canvasY - 8,
    visible: onScreen,
  };
}

/**
 * 오버레이 모드일 때 모든 월드 툴팁을 숨긴다.
 */
function hideAllTooltips() {
  scene.boxTooltips.value = scene.portfolioBoxes.value.map((box) => ({
    id: box.id,
    project: box.project,
    left: 0,
    top: 0,
    visible: false,
  }));
  scene.consoleTooltip.value = { left: 0, top: 0, visible: false };
  scene.infoBoardTooltip.value = { left: 0, top: 0, visible: false };
  scene.tabletTooltip.value = { left: 0, top: 0, visible: false };
}

onBeforeRender(() => {
  if (
    scene.cameraMode.value === "console" ||
    scene.cameraMode.value === "board" ||
    scene.cameraMode.value === "tablet"
  ) {
    hideAllTooltips();
    return;
  }

  const cam = camera.value as PerspectiveCamera | undefined;
  const canvas = renderer?.domElement as HTMLCanvasElement | undefined;
  if (!cam || !canvas) return;

  const rect = canvas.getBoundingClientRect();
  const parent = canvas.closest(".factory-scene-root") as HTMLElement | null;
  const parentRect = parent?.getBoundingClientRect() ?? rect;
  const width = sizes.width.value || rect.width;
  const height = sizes.height.value || rect.height;

  scene.boxTooltips.value = scene.portfolioBoxes.value.map((box) => {
    const screen = projectToScreen(
      cam,
      width,
      height,
      rect,
      parentRect,
      box.x,
      box.y,
      box.z,
    );
    return {
      id: box.id,
      project: box.project,
      ...screen,
    };
  });

  scene.consoleTooltip.value = projectToScreen(
    cam,
    width,
    height,
    rect,
    parentRect,
    CONSOLE_POSITION.x,
    2.15,
    CONSOLE_POSITION.z,
  );

  scene.infoBoardTooltip.value = projectToScreen(
    cam,
    width,
    height,
    rect,
    parentRect,
    INFO_BOARD_POSITION.x + 0.2,
    2.6,
    INFO_BOARD_POSITION.z,
  );

  scene.tabletTooltip.value = projectToScreen(
    cam,
    width,
    height,
    rect,
    parentRect,
    TABLET_POSITION.x,
    1.05,
    TABLET_POSITION.z,
  );
});
</script>

<template>
  <TresGroup />
</template>
