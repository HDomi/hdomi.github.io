import { defineNitroPlugin } from "nitropack/runtime/plugin";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    // 깃허브 오리진에 대한 무조건적인 CORS 프리패스 권한 강제 주입
    response.headers["Access-Control-Allow-Origin"] = "https://hdomi.github.io";
    response.headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS";
    response.headers["Access-Control-Allow-Headers"] = "*";
    response.headers["Access-Control-Allow-Credentials"] = "true";
  });
});
