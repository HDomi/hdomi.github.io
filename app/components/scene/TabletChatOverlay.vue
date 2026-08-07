<script setup lang="ts">
import { useFactoryScene } from "~/composables/useFactoryScene";

interface ChatMessage {
  id: number;
  role: "bot" | "user";
  text: string;
}

const scene = useFactoryScene();
const input = ref("");
const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: "bot",
    text: "안녕하세요. Domi Portal 작업대 어시스턴트입니다. 무엇이든 물어보세요.",
  },
]);
const listRef = ref<HTMLElement | null>(null);
let nextId = 2;

const compact = ref(false);

onMounted(() => {
  const mq = window.matchMedia("(max-width: 1024px)");
  compact.value = mq.matches;
  /**
   * 뷰포트 미디어 쿼리 변경을 반영한다.
   * @param {MediaQueryListEvent} e - 미디어 이벤트
   */
  const onChange = (e: MediaQueryListEvent) => {
    compact.value = e.matches;
  };
  mq.addEventListener("change", onChange);
  onBeforeUnmount(() => mq.removeEventListener("change", onChange));
});

watch(
  () => scene.cameraMode.value,
  (mode) => {
    if (mode === "tablet") {
      nextTick(() => scrollToBottom());
    }
  },
);

/**
 * 챗 목록을 맨 아래로 스크롤한다.
 */
function scrollToBottom() {
  const el = listRef.value;
  if (el) el.scrollTop = el.scrollHeight;
}

/**
 * 태블릿 챗봇 오버레이를 닫는다.
 */
function handleClose() {
  scene.closeTablet();
}

/**
 * 메시지를 전송한다. (응답은 준비중 고정)
 * @param {Event} [e] - 폼 이벤트
 */
function handleSubmit(e?: Event) {
  e?.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  messages.value.push({ id: nextId++, role: "user", text });
  input.value = "";
  nextTick(() => {
    messages.value.push({ id: nextId++, role: "bot", text: "준비중입니다" });
    nextTick(scrollToBottom);
  });
}
</script>

<template>
  <Transition name="tablet-zoom">
    <div
      v-if="scene.cameraMode.value === 'tablet'"
      class="tablet-overlay"
      :class="{ 'is-compact': compact }"
      role="dialog"
      aria-modal="true"
      aria-label="작업대 챗봇"
    >
      <div class="tablet-window">
        <header class="window-chrome">
          <div class="traffic">
            <button type="button" class="dot red" aria-label="닫기" @click="handleClose" />
            <span class="dot yellow" aria-hidden="true" />
            <span class="dot green" aria-hidden="true" />
          </div>
          <p class="window-title">Domi Assistant — Chat</p>
          <button type="button" class="close-x" aria-label="닫기" @click="handleClose">×</button>
        </header>

        <div class="chat-layout">
          <aside class="chat-sidebar" aria-hidden="true">
            <p class="side-label">CHANNELS</p>
            <div class="side-item is-active"># general</div>
            <div class="side-item"># factory</div>
            <div class="side-item"># archive</div>
            <p class="side-label">STATUS</p>
            <div class="side-status">Assistant · standby</div>
          </aside>

          <section class="chat-main">
            <div ref="listRef" class="chat-messages">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="bubble"
                :class="msg.role === 'user' ? 'is-user' : 'is-bot'"
              >
                <span class="bubble-role">{{ msg.role === "user" ? "YOU" : "DOMI" }}</span>
                <p>{{ msg.text }}</p>
              </div>
            </div>

            <form class="chat-input-bar" @submit="handleSubmit">
              <input
                v-model="input"
                type="text"
                class="chat-input"
                placeholder="메시지를 입력하세요…"
                autocomplete="off"
                maxlength="400"
              />
              <button type="submit" class="send-btn">보내기</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tablet-overlay {
  position: absolute;
  inset: 0;
  z-index: 24;
  display: flex;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
  padding: 10% 17.5%;
  background: rgba(4, 8, 12, 0.55);
  backdrop-filter: blur(5px);
}

/* 가로 65% → 양옆 (100-65)/2 = 17.5% */
.tablet-overlay.is-compact {
  padding: 10% 5%;
}

.tablet-window {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(10, 14, 18, 0.97);
  border: 1px solid rgba(57, 255, 20, 0.28);
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.window-chrome {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(57, 255, 20, 0.07), transparent);
}

.traffic {
  display: flex;
  gap: 0.4rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: inline-block;
}

.dot.red {
  background: #ff5f57;
  cursor: pointer;
  padding: 0;
}

.dot.yellow {
  background: #febc2e;
}

.dot.green {
  background: #28c840;
}

.window-title {
  flex: 1;
  text-align: center;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: rgba(190, 200, 210, 0.8);
}

.close-x {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: #e8eef4;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  font: inherit;
}

.close-x:hover,
.close-x:focus-visible {
  border-color: rgba(57, 255, 20, 0.55);
  color: #39ff14;
  outline: none;
}

.chat-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 180px 1fr;
}

.is-compact .chat-layout {
  grid-template-columns: 1fr;
}

.chat-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 0.85rem;
  background: rgba(0, 0, 0, 0.2);
}

.is-compact .chat-sidebar {
  display: none;
}

.side-label {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  color: #00c8ff;
  margin: 0.75rem 0 0.45rem;
}

.side-label:first-child {
  margin-top: 0;
}

.side-item {
  padding: 0.4rem 0.55rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: rgba(200, 210, 220, 0.75);
}

.side-item.is-active {
  background: rgba(57, 255, 20, 0.1);
  color: #e8ffe8;
  border: 1px solid rgba(57, 255, 20, 0.25);
}

.side-status {
  font-size: 0.75rem;
  color: rgba(170, 185, 200, 0.7);
  padding: 0.35rem 0.45rem;
}

.chat-main {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow: auto;
  padding: 1.1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.bubble {
  max-width: min(520px, 92%);
  padding: 0.75rem 0.9rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bubble.is-bot {
  align-self: flex-start;
  background: rgba(57, 255, 20, 0.06);
  border-color: rgba(57, 255, 20, 0.2);
}

.bubble.is-user {
  align-self: flex-end;
  background: rgba(0, 200, 255, 0.08);
  border-color: rgba(0, 200, 255, 0.25);
}

.bubble-role {
  display: block;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: rgba(170, 185, 200, 0.7);
  margin-bottom: 0.3rem;
}

.bubble p {
  margin: 0;
  color: #eef3f8;
  font-size: 0.92rem;
  line-height: 1.55;
}

.chat-input-bar {
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
}

.chat-input {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(8, 12, 16, 0.9);
  color: #f2f6fa;
  padding: 0.7rem 0.9rem;
  font: inherit;
  font-size: 0.92rem;
}

.chat-input:focus {
  outline: none;
  border-color: rgba(57, 255, 20, 0.45);
  box-shadow: 0 0 0 3px rgba(57, 255, 20, 0.12);
}

.send-btn {
  border: 1px solid rgba(57, 255, 20, 0.4);
  border-radius: 10px;
  background: rgba(57, 255, 20, 0.14);
  color: #39ff14;
  font: inherit;
  font-weight: 650;
  font-size: 0.85rem;
  padding: 0.7rem 1rem;
  cursor: pointer;
  white-space: nowrap;
}

.send-btn:hover {
  background: rgba(57, 255, 20, 0.22);
}

.tablet-zoom-enter-active,
.tablet-zoom-leave-active {
  transition: opacity 0.28s ease;
}

.tablet-zoom-enter-active .tablet-window,
.tablet-zoom-leave-active .tablet-window {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s ease;
}

.tablet-zoom-enter-from,
.tablet-zoom-leave-to {
  opacity: 0;
}

.tablet-zoom-enter-from .tablet-window,
.tablet-zoom-leave-to .tablet-window {
  opacity: 0;
  transform: scale(0.88);
}
</style>
