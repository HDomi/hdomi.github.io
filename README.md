# Domi Portal

3D 공장 로비에서 포트폴리오·포스팅을 탐색하는 개인 포탈입니다.  
Nuxt 4 SSG로 GitHub Pages에 배포하며, 콘텐츠는 Firebase Realtime Database에서 빌드 시 수집합니다.

사이트: [https://hdomi.github.io/](https://hdomi.github.io/)

---

## 주요 기능

### 3D 공장 로비
- WASD / 클릭·터치 이동, 3인칭 캐릭터
- **컨베이어 박스**: 프로젝트 카드(호버 툴팁, 클릭 이동)
- **포스팅 콘솔**: 근접 시 아카이브 오버레이
- **소개 보드**: 좌측 벽걸이 TV → 전체 보드 UI
- **챗봇 태블릿**: 작업대 패드 → Mac 톤 채팅 UI (입력 시 `준비중입니다`)
- 미니맵, 바닥 클릭 마커, 반응형 뷰포트(조이스틱·FOV)

### 블로그 / SEO
- `/blog/[uuid]` 포스팅 상세 (공장 테마 UI, Markdown)
- 빌드 타임 프리렌더로 크롤러·검색엔진 인덱싱
- 홈의 HTML 폴백 목록은 `sr-only`로 시각만 숨김 (DOM·프리렌더 유지)

### 데이터 / 배포
- Firebase RTDB에서 프로젝트·포스팅 fetch
- `generate-routes.ts`로 동적 `/blog/*` 경로 생성 후 `nuxt generate`
- GitHub Actions → GitHub Pages 자동 배포
- Google AdSense / Search Console 메타 연동

---

## 기술 스택

| 영역 | 스택 |
|------|------|
| Framework | Nuxt 4 (SSR/SSG), Vue 3 Composition API |
| 3D | Three.js, TresJS (`@tresjs/nuxt`, `@tresjs/core`) |
| 스타일 | SCSS (공장·터미널 다크 팔레트) |
| 마크다운 | `marked` |
| 데이터 | Firebase Realtime Database |
| 빌드 헬퍼 | `tsx`, `node-html-parser` |
| 패키지 매니저 | pnpm `10.15.0` (`packageManager` 필드) |
| CI/CD | GitHub Actions (`deploy-pages`), Node 22 |
| 호스팅 | GitHub Pages (`hdomi.github.io`) |

---

## 프로젝트 구조

```text
domi-portal/
├── .github/workflows/
│   └── deploy.yml                 # Pages 배포 (pnpm + Node 22 + generate)
├── app/
│   ├── app.vue
│   ├── assets/scss/
│   │   └── main.scss              # 글로벌·블로그 상세 공장 테마
│   ├── components/
│   │   ├── ProjectCard.vue        # (레거시 카드, 필요 시 재사용)
│   │   └── scene/                 # 3D 씬 구성
│   │       ├── FactoryScene.vue   # TresCanvas 셸 + 오버레이 마운트
│   │       ├── RoomEnvironment.vue
│   │       ├── ConveyorBelt.vue
│   │       ├── ControlConsole.vue
│   │       ├── InfoBoard.vue
│   │       ├── DeskTablet.vue
│   │       ├── PlayerController.vue
│   │       ├── FloorClickHandler.vue
│   │       ├── BoxTooltipProjector.vue
│   │       ├── SceneHud.vue
│   │       ├── BlogListOverlay.vue
│   │       ├── InfoBoardOverlay.vue
│   │       └── TabletChatOverlay.vue
│   ├── composables/
│   │   ├── useFactoryScene.ts     # 씬 공유 상태·충돌·위치 상수
│   │   └── useSceneViewport.ts    # 반응형 카메라/safe-area
│   ├── pages/
│   │   ├── index.vue              # 3D 홈 + SEO 폴백(sr-only)
│   │   └── blog/[id].vue          # 포스팅 상세
│   └── utils/
│       └── pixelTextures.ts       # 픽셀/보드/우드 텍스처
├── server/
│   ├── api/
│   │   ├── posts.ts               # 포스팅 목록
│   │   ├── posts/[id].ts          # 포스팅 상세
│   │   └── projects.ts            # 프로젝트 목록
│   └── utils/
│       └── firebase.ts            # RTDB fetch 유틸
├── scripts/
│   └── generate-routes.ts         # /blog/:uuid 프리렌더 경로 생성
├── public/
│   ├── ads.txt
│   ├── robots.txt
│   ├── favicon.png
│   └── .nojekyll
├── nuxt.config.ts
├── package.json
└── pnpm-lock.yaml
```

---

## 데이터 흐름

```text
Firebase RTDB
  ├─ /posts.json   → server/api/posts*, generate-routes.ts
  └─ /projects.json → server/api/projects.ts
         ↓
  pnpm run generate
         ↓
  prerender-routes.json + .output/public (SSG)
         ↓
  GitHub Pages
```

### 로컬 / CI 환경 변수

| 변수 | 용도 |
|------|------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | 서비스 계정 JSON (CI Secrets) |
| `FIREBASE_DATABASE_URL` | RTDB URL |

로컬은 `.env`에 동일 키를 두면 `generate-routes.ts`가 로드합니다. `.env`는 gitignore 대상입니다.

---

## 3D 씬 상호작용 요약

| 대상 | 동작 |
|------|------|
| 바닥 | 클릭 이동 + 목표 마커 |
| 포트폴리오 박스 | 호버 툴팁, 앞으로 이동, 근접 토스트 |
| 콘솔 | 이동 → 포스팅 아카이브 오버레이 |
| 소개 보드 | 이동 → 전체 소개 패널 |
| 태블릿 | 이동 → 챗봇 창 (가로 65% / ≤1024px 패딩 5%) |
| E / Esc | 근접 상호작용 / 오버레이 닫기 |

공유 상태는 `useFactoryScene` 모듈 스코프 ref를 사용합니다 (TresCanvas 경계로 Vue provide가 끊기는 경우 대비).

---

## 개발 가이드

### 설치 / 실행

```bash
pnpm install
pnpm run dev
```

### 정적 생성 (배포와 동일)

```bash
pnpm run generate
pnpm run preview
```

### 린트 / 포맷

```bash
pnpm run lint
pnpm run format
```

### 배포

`main` 푸시, `repository_dispatch(deploy_trigger)`, 또는 Actions `workflow_dispatch` 시:

1. `pnpm install`
2. `pnpm run generate` (Firebase secrets 주입)
3. `.output/public` → GitHub Pages

워크플로: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)  
- pnpm 버전은 `package.json`의 `packageManager`만 사용 (Action `version` 중복 지정 금지)

---

## 콘텐츠 추가

- **포스팅**: Firebase `/posts`에 uuid·title·summary·content·tags·createdAt 기록 → 재배포 시 `/blog/{uuid}` 프리렌더
- **프로젝트**: Firebase `/projects`에 url·title·description·image·siteName·tags 등 기록 → 컨베이어 박스로 노출

---

## 참고

- 홈 SEO 폴백은 화면에 보이지 않지만 프리렌더 HTML에 남습니다. AdSense 심사에서 가시 콘텐츠가 필요하다고 판단되면 짧은 공개 푸터를 다시 노출하면 됩니다.
- 3D 씬은 `ClientOnly`로 마운트되며, 노JS/크롤러는 HTML 폴백·블로그 상세로 콘텐츠를 읽습니다.
