# 🌌 Domi Portal (도미 프로젝트 포탈)

GitHub Pages에 배포한 개인 웹 프로젝트들을 일목요연하게 모아보고 홍보하기 위한 **모던 다크 테마 포탈 사이트**입니다.  
Nuxt 4(Nuxt 3 호환 모드)와 SCSS를 활용하여 고품질 UI와 우수한 성능, 검색 엔진 최적화(SEO)를 모두 만족하도록 개발되었습니다.

---

## 🚀 주요 기능 (Key Features)

### 1. 빌드 타임 메타데이터 수집 (Build-Time Metadata Scraper)
* **어떻게 동작하나요?** 브라우저단에서 API 통신으로 크롤링을 수행하는 대신, **빌드 과정에서 Node.js 환경의 독자적인 크롤링 스크립트**가 동작합니다.
* **이점:**
  * **CORS 에러 원천 방지:** 브라우저 외부(Node.js)에서 대상 사이트의 HTML을 호출하므로 도메인 간 리소스 제한 문제(CORS)가 전혀 발생하지 않습니다.
  * **속도 단축:** 클라이언트가 접속하자마자 즉시 사전 구성된 정적 데이터를 보여주므로 로딩 지연이 0초에 수렴합니다.
  * **장애 방지:** 외부 사이트가 일시적으로 다운되더라도, 빌드 타임에 기록된 마지막 정상 메타데이터(혹은 폴백 데이터)를 보여주므로 화면이 깨지거나 빈 카드로 노출되지 않습니다.

### 2. 검색 엔진 최적화 (SEO & Crawler Friendly)
* **Nuxt 정적 사이트 생성 (SSG):** 수집된 프로젝트 메타데이터를 번들에 결합해 **각 프로젝트 카드가 순수 HTML 소스코드에 pre-render(사전 렌더링)** 되도록 구현했습니다.
* **이점:** 구글(Google), 네이버(Naver), 다음(Daum) 등 모든 검색 엔진의 크롤링 로봇이 JavaScript 자원을 실행해 기다릴 필요 없이 포탈에 리스트업된 모든 프로젝트의 제목, 설명, 링크, 태그를 즉각적으로 수집하여 인덱싱(색인)해 갈 수 있습니다.

### 3. 실시간 유기적 필터 및 검색 (Real-time Search & Filter)
* **실시간 텍스트 검색:** 검색창 입력을 통해 프로젝트의 제목, 설명, 태그, URL 중 키워드가 일치하는 항목을 실시간으로 화면에 렌더링합니다.
* **태그 클라우드 필터링:** 프로젝트들에 달린 메타 태그를 동적으로 추출하여 상단에 필터 버튼으로 노출합니다. 특정 태그를 클릭해 동일 종류의 프로젝트만 모아볼 수 있습니다.

### 4. 모던 & 프리미엄 UI 디자인 (SCSS Nesting & Responsive)
* **글래스모피즘(Glassmorphism):** 배경 그리드(Mesh Grid)와 카드 테두리의 미세한 투명 보더, 부드러운 `backdrop-filter: blur`를 중첩해 깊이 있는 입체감을 부여했습니다.
* **네온 그래디언트 글로우:** 세련된 Indigo, Purple, Teal HSL 변수를 조합하여 마우스를 카드 위에 호버했을 때 점진적으로 글로우 효과가 피어나고 이미지가 확대되는 프리미엄 애니메이션을 구축했습니다.
* **완벽한 반응형 레이아웃:** CSS Grid와 미디어 쿼리를 사용해 데스크톱, 태블릿, 모바일 기기 등 모든 화면 폭에 맞추어 카드 열(Column) 개수가 자연스럽게 적응(Flex)하도록 설계되었습니다.

### 5. 수익화 및 배포 파이프라인
* **구글 애드센스(AdSense) 연동:** `nuxt.config.ts` 파일의 헤더 설정에 애드센스 비동기 광고 스크립트가 표준 규격으로 자동 삽입되어 배포됩니다.
* **GitHub Actions 직접 배포:** 최신 배포 규격(`actions/deploy-pages@v4`)을 활용하여, 저장소 푸시 한 번으로 빌드 완료된 `.output/public` 정적 리소스를 GitHub Pages 호스팅 환경에 즉각 배포합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

* **Framework:** Nuxt 4 (Nuxt 3 Compatibility Version)
* **Logic/State:** Vue 3 Composition API (`<script setup>`)
* **Styling:** SCSS (Sass 1.x compiler)
* **Scraper Parser:** `node-html-parser` (Fast HTML parsing in Node.js)
* **Package Manager:** `pnpm` (v9 & v11)
* **CI/CD:** GitHub Actions (OIDC OAuth `deploy-pages`)

---

## 📂 프로젝트 구조 (Project Directory)

```text
domi-portal/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions 자동 배포 워크플로우 파일
├── app/
│   ├── assets/scss/
│   │   └── main.scss       # SCSS 변수, 글래스모피즘, 글로우 테마 스타일시트
│   ├── components/
│   │   └── ProjectCard.vue # 프로젝트 카드 UI 및 이미지 로딩 실패 대응 컴포넌트
│   ├── pages/
│   │   └── index.vue       # 실시간 검색/필터 기능 및 전체 레이아웃
│   └── app.vue             # NuxtPage 라우팅 인젝터
├── config/
│   └── projects.json       # 메타데이터를 수집할 대상 URL 목록 어레이
├── public/
│   ├── data/
│   │   └── projects-metadata.json # 빌드 시 자동 생성되는 크롤링 데이터
│   ├── .nojekyll           # GitHub Pages 언더바 폴더 인식 우회 파일
│   └── robots.txt          # 검색 로봇 접근 허가 설정
├── scripts/
│   └── fetch-metadata.js   # 프로젝트 메타 태그 크롤러 스크립트
├── nuxt.config.ts          # SSG 설정, SEO Meta, Google AdSense 설정
├── package.json            # 스크립트 파이프라인 구성 및 의존성 라이브러리
└── .npmrc                  # 의존성 빌드 도구 권한 허용 파일 (pnpm workspace 우회)
```

---

## 🧑‍💻 개발 및 빌드 가이드 (Developer Guide)

### 1. 로컬 개발 환경 구동
```bash
# 의존성 패키지 설치
pnpm install

# 로컬 개발 서버 구동 (실행 전 자동으로 메타데이터 크롤러가 한 차례 가동됩니다)
pnpm run dev
```

### 2. 정적 파일 생성 및 확인 (SSG)
```bash
# 크롤러 실행 후 .output/public 에 HTML/CSS 사전 정적 빌드본을 출력합니다
pnpm run generate
```

### 3. 새 프로젝트 포탈에 추가하기
1. [config/projects.json](file:///Users/im_1767/Desktop/Dev/domi-portal/config/projects.json) 파일에 추가하고 싶은 GitHub Pages 배포 사이트의 절대 URL을 추가합니다:
   ```json
   [
     "https://hdomi.github.io/random-target-picker/",
     "https://hdomi.github.io/new-project-url/"
   ]
   ```
2. Git Commit 후 `main` 브랜치에 Push하면 GitHub Actions에 의해 자동으로 수집과 재배포가 이뤄집니다.

---

## 🌐 메인 도메인(hdomi.github.io) 배포 가이드

해당 포탈 주소를 서브 패스(`hdomi.github.io/domi-portal/`)가 아닌 루트 메인 도메인(`https://hdomi.github.io/`)으로 서비스하려면 아래 절차를 진행해 주세요.

1. **GitHub 저장소 명칭 변경:**
   * GitHub 웹사이트의 `domi-portal` 레포지토리 페이지로 이동합니다.
   * **Settings (설정)** 탭 -> **General** 항목으로 갑니다.
   * 저장소 명칭(Repository name)을 **`hdomi.github.io`**로 수정한 뒤 **Rename**을 누릅니다.
2. **로컬 원격(Remote) 주소 동기화:**
   * 본인의 로컬 PC 터미널에서 아래 명령을 통해 수정된 원격 깃허브 주소를 입력해 줍니다.
   ```bash
   git remote set-url origin https://github.com/HDomi/hdomi.github.io.git
   ```
3. 저장소 명이 `hdomi.github.io`로 변경되면 GitHub Pages 규칙에 의거하여 자동으로 메인 루트 도메인에서 포탈 서비스가 노출됩니다.
