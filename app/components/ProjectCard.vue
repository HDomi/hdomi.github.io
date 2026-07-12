<template>
  <div class="project-card">
    <!-- Project Thumbnail -->
    <div class="card-image-container">
      <img
        v-if="project.image"
        :src="project.image"
        :alt="project.title"
        class="card-image"
        loading="lazy"
        @error="handleImageError"
      />
      <!-- Fallback design when image is missing or fails to load -->
      <div v-else class="card-image-fallback">
        <svg
          class="fallback-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
          />
        </svg>
        <span>{{ project.siteName }}</span>
      </div>
      <!-- Domain Badge -->
      <span class="card-badge">{{ project.siteName }}</span>
    </div>

    <!-- Project Metadata Details -->
    <div class="card-body">
      <h3 class="card-title">{{ project.title }}</h3>
      <p class="card-desc">{{ project.description }}</p>

      <!-- Tags list -->
      <div v-if="project.tags && project.tags.length" class="card-tags">
        <span v-for="tag in project.tags.slice(0, 4)" :key="tag" class="card-tag">
          #{{ tag }}
        </span>
      </div>

      <!-- Card Footer Actions -->
      <div class="card-footer">
        <span class="last-updated"> Scraped: {{ formattedDate }} </span>
        <a :href="project.url" target="_blank" rel="noopener noreferrer" class="launch-btn">
          <span>방문하기</span>
          <svg viewBox="0 0 24 24">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
});

// 이미지 로드 실패 시 대체 표시 로직
const handleImageError = (event) => {
  event.target.style.display = "none";
  const container = event.target.parentElement;
  if (container) {
    const fallback = document.createElement("div");
    fallback.className = "card-image-fallback";
    fallback.innerHTML = `
      <svg class="fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
      <span>${props.project.siteName}</span>
    `;
    container.appendChild(fallback);
  }
};

// 날짜 형식 변환
const formattedDate = computed(() => {
  if (!props.project.scrapedAt) return "-";
  try {
    const date = new Date(props.project.scrapedAt);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
});
</script>
