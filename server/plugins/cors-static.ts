import { defineNitroPlugin } from "nitropack/runtime/plugin";

export default defineNitroPlugin((nitroApp) => {
  // Nitro 엔진이 정적 파일(_nuxt 하위 자산 등)을 서빙하기 직전에 트리거되는 하위 훅 가로채기
  nitroApp.hooks.hook("nitro:document" as any, (htmlContext, { event }) => {
    // 혹시 몰라 문서 응답 헤더도 방어
    if (event) {
      event.node.res.setHeader("Access-Control-Allow-Origin", "https://hdomi.github.io");
      event.node.res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      event.node.res.setHeader("Access-Control-Allow-Headers", "*");
    }
  });

  // 프로덕션 서빙 시 정적 파일 핸들러 단에서 응답 헤더를 강제로 문신처럼 새기는 로직
  nitroApp.hooks.hook("request", (event) => {
    if (event.node.req.url?.startsWith("/_nuxt/")) {
      event.node.res.setHeader("Access-Control-Allow-Origin", "https://hdomi.github.io");
      event.node.res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      event.node.res.setHeader("Access-Control-Allow-Headers", "*");
      event.node.res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  });
});
