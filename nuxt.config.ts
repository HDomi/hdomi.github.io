import fs from "node:fs";
import path from "node:path";

const getPrerenderRoutes = () => {
  const filePath = path.join(process.cwd(), "prerender-routes.json");
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      console.error("Failed to parse prerender-routes.json:", e);
    }
  }
  return [];
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  typescript: {
    tsConfig: {
      compilerOptions: {
        module: "ESNext",
      },
    },
  },

  // 정적 페이지 사전 렌더링(SSG)을 위한 SSR 활성화
  ssr: true,

  // 글로벌 CSS/SCSS 가져오기
  buildId: process.env.NODE_ENV === "production" ? String(Date.now()) : undefined,
  css: ["~/assets/scss/main.scss"],
  buildAssetsDir: "/_nuxt/",

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", ...getPrerenderRoutes()],
    },
  },
  // SEO 설정을 포함한 앱 구성
  app: {
    baseURL: "/",
    head: {
      title: "Domi Portal",
      htmlAttrs: {
        lang: "ko",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "도미가 개발하고 배포한 다양한 GitHub Pages 웹 프로젝트들을 한눈에 모아보고 검색할 수 있는 포탈 사이트입니다.",
        },
        { name: "format-detection", content: "telephone=no" },

        // 오픈 그래프 (Open Graph)
        { property: "og:type", content: "website" },
        {
          property: "og:title",
          content: "Domi Portal",
        },
        {
          property: "og:description",
          content:
            "도미가 개발하고 배포한 다양한 GitHub Pages 웹 프로젝트들을 한눈에 모아보고 검색할 수 있는 포탈 사이트입니다.",
        },
        { property: "og:url", content: "https://hdomi.github.io/" },

        // 트위터 (Twitter)
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Domi Portal",
        },
        {
          name: "twitter:description",
          content:
            "도미가 개발하고 배포한 다양한 GitHub Pages 웹 프로젝트들을 한눈에 모아보고 검색할 수 있는 포탈 사이트입니다.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
      script: [
        {
          src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3346442614533622",
          async: true,
          crossorigin: "anonymous",
        },
      ],
    },
  },
});
