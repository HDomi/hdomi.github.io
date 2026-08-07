import type { Ref } from "vue";

export type ViewportMode = "narrow" | "wide";

export interface SceneViewportState {
  width: Ref<number>;
  height: Ref<number>;
  aspect: Ref<number>;
  mode: Ref<ViewportMode>;
  isPortrait: Ref<boolean>;
  cameraDistance: Ref<number>;
  cameraFov: Ref<number>;
  safeArea: Ref<{ top: number; right: number; bottom: number; left: number }>;
  bind: (el: HTMLElement | null) => void;
}

const NARROW_BREAKPOINT = 768;

/**
 * 씬 컨테이너·visualViewport 변화를 구독해 카메라/HUD용 뷰포트 상태를 반환한다.
 * @returns {SceneViewportState} 반응형 뷰포트 상태와 bind 함수
 */
export function useSceneViewport(): SceneViewportState {
  const width = ref(1);
  const height = ref(1);
  const aspect = computed(() => width.value / Math.max(height.value, 1));
  const mode = computed<ViewportMode>(() =>
    width.value < NARROW_BREAKPOINT ? "narrow" : "wide",
  );
  const isPortrait = computed(() => height.value > width.value);

  const cameraDistance = computed(() => {
    if (mode.value === "narrow") {
      return isPortrait.value ? 15.5 : 13.5;
    }
    return isPortrait.value ? 14 : 12;
  });

  const cameraFov = computed(() => {
    if (mode.value === "narrow" && isPortrait.value) return 48;
    if (mode.value === "narrow") return 44;
    return isPortrait.value ? 46 : 40;
  });

  const safeArea = ref({ top: 0, right: 0, bottom: 0, left: 0 });

  let container: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  /**
   * CSS env(safe-area-inset-*) 값을 읽어 숫자로 변환한다.
   * @returns {{ top: number; right: number; bottom: number; left: number }} safe-area inset(px)
   */
  function readSafeArea() {
    if (typeof window === "undefined" || typeof getComputedStyle === "undefined") {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    const styles = getComputedStyle(document.documentElement);
    /**
     * @param {string} name - CSS 변수 이름
     * @returns {number} 픽셀 값
     */
    const read = (name: string) => {
      const raw = styles.getPropertyValue(name).trim();
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n : 0;
    };
    return {
      top: read("--sat") || readEnv("safe-area-inset-top"),
      right: read("--sar") || readEnv("safe-area-inset-right"),
      bottom: read("--sab") || readEnv("safe-area-inset-bottom"),
      left: read("--sal") || readEnv("safe-area-inset-left"),
    };
  }

  /**
   * env() 값을 임시 요소로 측정한다.
   * @param {string} inset - safe-area inset 이름
   * @returns {number} 픽셀 값
   */
  function readEnv(inset: string): number {
    const probe = document.createElement("div");
    probe.style.cssText = `position:fixed;visibility:hidden;padding:env(${inset});`;
    document.body.appendChild(probe);
    const value = Number.parseFloat(getComputedStyle(probe).paddingTop) || 0;
    probe.remove();
    return value;
  }

  /**
   * 컨테이너와 visualViewport 기준으로 크기를 갱신한다.
   */
  function measure() {
    const vv = window.visualViewport;
    const rect = container?.getBoundingClientRect();
    const nextW = Math.max(1, Math.floor(rect?.width || vv?.width || window.innerWidth));
    const nextH = Math.max(1, Math.floor(rect?.height || vv?.height || window.innerHeight));
    width.value = nextW;
    height.value = nextH;
    safeArea.value = readSafeArea();
  }

  /**
   * 측정 대상 DOM을 연결하고 리스너를 등록한다.
   * @param {HTMLElement | null} el - 씬 래퍼 요소
   */
  function bind(el: HTMLElement | null) {
    container = el;
    if (!import.meta.client || !el) return;

    measure();
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(el);

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
  }

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    if (!import.meta.client) return;
    window.removeEventListener("resize", measure);
    window.removeEventListener("orientationchange", measure);
    window.visualViewport?.removeEventListener("resize", measure);
    window.visualViewport?.removeEventListener("scroll", measure);
  });

  return {
    width,
    height,
    aspect,
    mode,
    isPortrait,
    cameraDistance,
    cameraFov,
    safeArea,
    bind,
  };
}
