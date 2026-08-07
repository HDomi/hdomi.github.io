<script setup lang="ts">
import FactoryScene from "~/components/scene/FactoryScene.vue";

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

const { data: projectsList } = await useFetch<Project[]>("/api/projects");
const { data: postsList } = await useFetch<Post[]>("/api/posts");

const projects = computed(() => projectsList.value || []);
const posts = computed(() => postsList.value || []);

/**
 * 포스팅 날짜를 로컬 포맷으로 변환한다.
 * @param {string} createdAt - ISO 날짜
 * @returns {string} 표시용 날짜
 */
function formatBlogDate(createdAt: string): string {
  if (!createdAt) return "";
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(createdAt));
  } catch {
    return "";
  }
}

useHead({
  title: "Domi Portal",
  meta: [
    {
      name: "description",
      content:
        "도미가 개발하고 배포한 웹 프로젝트와 기술 에세이를 3D 포트폴리오와 블로그로 탐색할 수 있는 포탈입니다.",
    },
  ],
});
</script>

<template>
  <div class="portal-page">
    <section class="scene-section" aria-label="3D 포트폴리오 공간">
      <FactoryScene :posts="posts" :projects="projects" />
    </section>

    <!-- SEO / AdSense / 크롤러용 HTML (시각적으로만 숨김, DOM·프리렌더에는 유지) -->
    <section class="seo-fallback" aria-label="콘텐츠 목록">
      <header class="fallback-header">
        <h1>Domi Portal</h1>
        <p>
          실리콘의 연산과 인간의 망각을 성찰하며, 도미가 직접 개발하고 배포한 웹 프로젝트 및 기술
          에세이를 기록하는 공간입니다.
        </p>
      </header>

      <div class="fallback-grid">
        <div>
          <h2>프로젝트</h2>
          <ul>
            <li v-for="project in projects" :key="project.url">
              <a :href="project.url" target="_blank" rel="noopener noreferrer">
                {{ project.title || project.siteName || project.url }}
              </a>
              <p v-if="project.description">{{ project.description }}</p>
            </li>
            <li v-if="!projects.length">등록된 프로젝트가 없습니다.</li>
          </ul>
        </div>

        <div>
          <h2>포스팅</h2>
          <ul>
            <li v-for="post in posts" :key="post.uuid">
              <NuxtLink :to="`/blog/${post.uuid}`">{{ post.title }}</NuxtLink>
              <time v-if="post.createdAt" :datetime="post.createdAt">
                {{ formatBlogDate(post.createdAt) }}
              </time>
              <p v-if="post.summary">{{ post.summary }}</p>
            </li>
            <li v-if="!posts.length">등록된 포스팅이 없습니다.</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.portal-page {
  background: #0f1011;
  color: #f2f4f7;
  min-height: 100svh;
  min-height: 100dvh;
  overflow: hidden;
}

.scene-section {
  position: relative;
  width: 100%;
  height: 100svh;
  height: 100dvh;
  overflow: hidden;
}

/**
 * 시각적으로만 숨김 — display:none 이 아님.
 * 프리렌더 HTML·크롤러·스크린리더에는 텍스트가 남음.
 */
.seo-fallback {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
