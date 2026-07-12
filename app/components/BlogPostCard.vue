<template>
  <div class="project-card blog-post-card">
    <div class="card-image-container">
      <!-- Premium dynamic-feel gradient header for blog post fallback -->
      <div class="card-image-fallback blog-card-header">
        <svg
          class="fallback-icon blog-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        <span class="blog-date-overlay">{{ formattedDate }}</span>
      </div>
      <!-- Category Badge -->
      <span class="card-badge blog-badge">Tech Blog</span>
    </div>

    <!-- Blog Metadata Details -->
    <div class="card-body">
      <h3 class="card-title">{{ post.title }}</h3>
      <p class="card-desc">{{ post.summary || "작성된 요약이 없습니다." }}</p>

      <!-- Tags list -->
      <div v-if="post.tags && post.tags.length" class="card-tags">
        <span v-for="tag in post.tags" :key="tag" class="card-tag"> #{{ tag }} </span>
      </div>

      <!-- Card Footer Actions -->
      <div class="card-footer">
        <span class="last-updated">
          {{ relativeTime }}
        </span>
        <NuxtLink :to="'/blog/' + post.uuid" class="launch-btn blog-btn">
          <span>읽어보기</span>
          <svg viewBox="0 0 24 24">
            <path
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Post {
  uuid: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
}

const props = defineProps<{
  post: Post;
}>();

// 포맷팅된 표시 날짜 (YYYY. MM. DD)
const formattedDate = computed(() => {
  if (!props.post.createdAt) return "";
  try {
    const date = new Date(props.post.createdAt);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
});

// 상대적 시간 표시 (예: 2시간 전, 3일 전 등)
const relativeTime = computed(() => {
  if (!props.post.createdAt) return "-";
  try {
    const date = new Date(props.post.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHr < 24) return `${diffHr}시간 전`;
    if (diffDay < 30) return `${diffDay}일 전`;

    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
});
</script>
