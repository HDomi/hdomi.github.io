<template>
  <div class="app-container">
    <!-- Ambient glow decorative circles -->
    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <!-- Main Hero -->
    <section class="hero">
      <div class="main-logo">
        <div class="logo-item">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
          </div>
          <h1>Domi Portal</h1>
        </div>
        <div class="header-links">
          <a href="https://github.com/hdomi" target="_blank" rel="noopener noreferrer">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
              />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
      <p>제가 개발하고 배포한 다양한 웹 프로젝트와 최신 기술 블로그 글을 모아보는 포탈입니다.</p>
    </section>

    <!-- Navigation Tabs System -->
    <div class="tabs-wrapper-main">
      <div class="tabs-container">
        <button
          class="tab-trigger"
          :class="{ active: currentTab === 'projects' }"
          @click="currentTab = 'projects'"
        >
          <svg
            class="tab-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
            />
          </svg>
          <span>프로젝트 (Projects)</span>
        </button>
        <button
          class="tab-trigger"
          :class="{ active: currentTab === 'blog' }"
          @click="currentTab = 'blog'"
        >
          <svg
            class="tab-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
            />
          </svg>
          <span>기술 블로그 (Blog)</span>
        </button>
      </div>
    </div>

    <!-- Controls (Search & Tags) -->
    <div class="controls">
      <!-- Search Input -->
      <div class="search-wrapper">
        <svg
          class="search-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="search-input"
        />
      </div>

      <!-- Tag Filter pills -->
      <div v-if="allTags.length" class="tags-wrapper">
        <button class="tag-btn" :class="{ active: selectedTag === null }" @click="selectTag(null)">
          전체 보기
        </button>
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-btn"
          :class="{ active: selectedTag === tag }"
          @click="selectTag(tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <!-- Main List Grids -->
    <main>
      <!-- Projects Tab Grid -->
      <div v-show="currentTab === 'projects'">
        <div v-if="filteredProjects.length" class="project-grid">
          <ProjectCard v-for="project in filteredProjects" :key="project.url" :project="project" />
        </div>
        <div v-else class="empty-state tags-wrapper">
          <p>검색 결과와 일치하는 프로젝트가 없습니다.</p>
          <button class="tag-btn active" @click="resetFilters">초기화</button>
        </div>
      </div>

      <!-- Blog Tab Grid -->
      <div v-show="currentTab === 'blog'">
        <div v-if="filteredPosts.length" class="project-grid">
          <BlogPostCard v-for="post in filteredPosts" :key="post.uuid" :post="post" />
        </div>
        <div v-else class="empty-state tags-wrapper">
          <p>검색 결과와 일치하는 블로그 게시글이 없습니다.</p>
          <button class="tag-btn active" @click="resetFilters">초기화</button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer>
      <p>
        © {{ new Date().getFullYear() }}
        <a href="https://github.com/hdomi" target="_blank" rel="noopener noreferrer">hdomi</a>. All
        rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useFetch } from "#app";

// 타입 정의
interface Project {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  tags: string[];
  scrapedAt: string;
  success: boolean;
  error?: string;
}

interface Post {
  uuid: string;
  title: string;
  summary: string;
  createdAt: string;
  tags: string[];
}

// 활성화된 탭 상태
const currentTab = ref<"projects" | "blog">("projects");

// 검색 및 필터 상태
const searchQuery = ref("");
const selectedTag = ref<string | null>(null);

// 탭을 전환할 때 태그 필터 초기화
watch(currentTab, () => {
  selectedTag.value = null;
});

// 활성화된 탭에 따른 동적 검색 플레이스홀더
const searchPlaceholder = computed(() => {
  return currentTab.value === "projects"
    ? "프로젝트 제목, 설명 또는 태그 검색..."
    : "블로그 글 제목, 요약 또는 태그 검색...";
});

// Firebase API에서 동적으로 데이터 가져오기
const { data: projectsList } = await useFetch<Project[]>("/api/projects");
const { data: postsList } = await useFetch<Post[]>("/api/posts");

// 데이터를 안전하게 래핑
const projects = computed<Project[]>(() => projectsList.value || []);
const posts = computed<Post[]>(() => postsList.value || []);

// 활성화된 탭을 기반으로 고유한 태그 추출
const allTags = computed<string[]>(() => {
  const tagsSet = new Set<string>();

  if (currentTab.value === "projects") {
    projects.value.forEach((p) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((t) => tagsSet.add(t));
      }
    });
  } else {
    posts.value.forEach((p) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((t) => tagsSet.add(t));
      }
    });
  }

  return Array.from(tagsSet).sort();
});

// 프로젝트 필터링 로직
const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    // 1. 태그 필터링
    if (selectedTag.value && (!p.tags || !p.tags.includes(selectedTag.value))) {
      return false;
    }

    // 2. 검색어 필터링
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      const matchTitle = p.title?.toLowerCase().includes(query);
      const matchDesc = p.description?.toLowerCase().includes(query);
      const matchTags = p.tags?.some((tag) => tag.toLowerCase().includes(query));
      const matchUrl = p.url?.toLowerCase().includes(query);

      return matchTitle || matchDesc || matchTags || matchUrl;
    }

    return true;
  });
});

// 블로그 포스트 필터링 로직
const filteredPosts = computed(() => {
  return posts.value.filter((p) => {
    // 1. 태그 필터링
    if (selectedTag.value && (!p.tags || !p.tags.includes(selectedTag.value))) {
      return false;
    }

    // 2. 검색어 필터링
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      const matchTitle = p.title?.toLowerCase().includes(query);
      const matchSummary = p.summary?.toLowerCase().includes(query);
      const matchTags = p.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchTitle || matchSummary || matchTags;
    }

    return true;
  });
});

// 태그 선택 동작
const selectTag = (tag: string | null) => {
  selectedTag.value = tag;
};

// 초기화 동작
const resetFilters = () => {
  searchQuery.value = "";
  selectedTag.value = null;
};
</script>
