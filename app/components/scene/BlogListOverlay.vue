<script setup lang="ts">
import type { PostItem } from "~/composables/useFactoryScene";
import { useFactoryScene } from "~/composables/useFactoryScene";

interface Props {
  posts: PostItem[];
  narrow: boolean;
}

defineProps<Props>();
const scene = useFactoryScene();

/**
 * 포스팅 상세로 이동한다.
 * @param {string} uuid - 포스트 UUID
 */
function openPost(uuid: string) {
  navigateTo(`/blog/${uuid}`);
}

/**
 * 날짜를 짧게 포맷한다.
 * @param {string} createdAt - ISO 날짜
 * @returns {string} 표시용 날짜
 */
function formatDate(createdAt: string): string {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(createdAt));
  } catch {
    return "";
  }
}
</script>

<template>
  <Transition name="overlay-fade">
    <div
      v-if="scene.cameraMode.value === 'console'"
      class="blog-overlay"
      :class="{ 'is-narrow': narrow }"
      role="dialog"
      aria-label="포스팅 리스트"
    >
      <div class="overlay-panel">
        <header class="overlay-header">
          <div>
            <p class="system-label">SYSTEM ACTIVE</p>
            <h2>포스팅 아카이브</h2>
          </div>
          <button type="button" class="close-btn" @click="scene.closeConsole()">닫기</button>
        </header>

        <ul class="post-list">
          <li v-for="post in posts" :key="post.uuid">
            <button type="button" class="post-item" @click="openPost(post.uuid)">
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              <strong class="post-title">{{ post.title }}</strong>
              <span v-if="post.summary" class="post-summary">{{ post.summary }}</span>
              <span v-if="post.tags?.length" class="post-tags">
                <span v-for="tag in post.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
              </span>
            </button>
          </li>
          <li v-if="!posts.length" class="empty">아직 등록된 포스팅이 없습니다.</li>
        </ul>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.blog-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  background: rgba(4, 8, 12, 0.35);
  backdrop-filter: blur(2px);
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  box-sizing: border-box;
}

.blog-overlay.is-narrow {
  align-items: flex-end;
  justify-content: center;
}

.overlay-panel {
  width: min(100%, max(420px, 33vw));
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(10, 14, 18, 0.94);
  border: 1px solid rgba(57, 255, 20, 0.28);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.is-narrow .overlay-panel {
  width: 100%;
  max-height: min(70vh, 560px);
  border-radius: 16px 16px 10px 10px;
}

.overlay-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.system-label {
  color: #39ff14;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  margin-bottom: 0.25rem;
}

.overlay-header h2 {
  font-size: 1.1rem;
  color: #f2f6fa;
  font-weight: 650;
}

.close-btn {
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #d7dee6;
  border-radius: 8px;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
  font: inherit;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  overflow: auto;
  flex: 1;
}

.post-item {
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  border-radius: 10px;
  padding: 0.85rem 0.9rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font: inherit;
}

.post-item:hover,
.post-item:focus-visible {
  background: rgba(57, 255, 20, 0.06);
  border-color: rgba(57, 255, 20, 0.2);
  outline: none;
}

.post-date {
  font-size: 0.72rem;
  color: rgba(170, 185, 200, 0.75);
}

.post-title {
  color: #f5f8fb;
  font-size: 0.95rem;
}

.post-summary {
  font-size: 0.8rem;
  color: rgba(190, 200, 210, 0.78);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.tag {
  font-size: 0.68rem;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  background: rgba(0, 180, 220, 0.15);
  color: #8fe9ff;
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(180, 190, 200, 0.7);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
