# 1단계: 빌드 환경 구성
FROM node:20-alpine AS builder

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사 및 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Nuxt 빌드 실행
RUN pnpm run build

# 2단계: Node.js 실행 환경 구성
FROM node:20-alpine

WORKDIR /app

# 빌드된 파일 복사
COPY --from=builder /app/.output ./.output

# 포트 설정 및 컨테이너 실행
ENV PORT=1131
EXPOSE 1131

CMD ["node", ".output/server/index.mjs"]
