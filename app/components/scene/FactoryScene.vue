<script setup lang="ts">
import type { PostItem, ProjectItem } from "~/composables/useFactoryScene";
import { syncFactoryScene } from "~/composables/useFactoryScene";
import { useSceneViewport } from "~/composables/useSceneViewport";
import RoomEnvironment from "./RoomEnvironment.vue";
import ConveyorBelt from "./ConveyorBelt.vue";
import ControlConsole from "./ControlConsole.vue";
import InfoBoard from "./InfoBoard.vue";
import DeskTablet from "./DeskTablet.vue";
import PlayerController from "./PlayerController.vue";
import FloorClickHandler from "./FloorClickHandler.vue";
import BoxTooltipProjector from "./BoxTooltipProjector.vue";
import SceneHud from "./SceneHud.vue";
import BlogListOverlay from "./BlogListOverlay.vue";
import InfoBoardOverlay from "./InfoBoardOverlay.vue";
import TabletChatOverlay from "./TabletChatOverlay.vue";

interface Props {
  posts: PostItem[];
  projects: ProjectItem[];
}

const props = defineProps<Props>();

const rootRef = ref<HTMLElement | null>(null);
const viewport = useSceneViewport();

const dpr = computed(() =>
  import.meta.client ? Math.min(window.devicePixelRatio || 1, 2) : 1,
);

const cameraPosition = computed(() => {
  const d = viewport.cameraDistance.value;
  return [0, d * 0.46, 3.5 + d * 0.82] as [number, number, number];
});

watch(
  () => [props.posts, props.projects, viewport.mode.value] as const,
  ([posts, projects, mode]) => {
    syncFactoryScene({ posts, projects, mode });
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  viewport.bind(rootRef.value);
});
</script>

<template>
  <div ref="rootRef" class="factory-scene-root">
    <ClientOnly>
      <TresCanvas
        clear-color="#4a5360"
        :shadows="true"
        :alpha="false"
        :dpr="dpr"
        class="factory-canvas"
      >
        <TresPerspectiveCamera
          :position="cameraPosition"
          :fov="viewport.cameraFov.value"
          :near="0.1"
          :far="120"
          make-default
        />

        <RoomEnvironment />
        <ConveyorBelt :projects="projects" />
        <ControlConsole />
        <InfoBoard />
        <DeskTablet />
        <PlayerController
          :camera-distance="viewport.cameraDistance.value"
          :camera-fov="viewport.cameraFov.value"
        />
        <FloorClickHandler />
        <BoxTooltipProjector />
      </TresCanvas>
      <template #fallback>
        <div class="scene-fallback">3D 씬 로딩 중…</div>
      </template>
    </ClientOnly>

    <SceneHud
      :safe-top="viewport.safeArea.value.top"
      :safe-right="viewport.safeArea.value.right"
      :safe-bottom="viewport.safeArea.value.bottom"
      :safe-left="viewport.safeArea.value.left"
    />

    <BlogListOverlay :posts="posts" :narrow="viewport.mode.value === 'narrow'" />
    <InfoBoardOverlay :narrow="viewport.mode.value === 'narrow'" />
    <TabletChatOverlay />
  </div>
</template>

<style scoped>
.factory-scene-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  overflow: hidden;
  background: #4a5360;
  touch-action: none;
}

.factory-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.scene-fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  color: rgba(200, 210, 220, 0.7);
  font-size: 0.95rem;
}
</style>
