# 1. 환경 설정 및 의존성 설치
FROM node:18-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi


# 2. Next.js 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This will do the trick, use the corresponding env file for each environment.
COPY .env.production.sample .env.production
RUN npm run build

# 3. Next.js 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# container 환경에 시스템 사용자를 추가함
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# next.config.js에서 output을 standalone으로 설정하면 
# 빌드에 필요한 최소한의 파일만 ./next/standalone로 출력이 된다.
# standalone 결과물에는 public 폴더와 static 폴더 내용은 포함되지 않으므로, 따로 복사를 해준다.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs
# 컨테이너가 사용할 포트를 설정, 이 이미지를 기반으로 실행된 컨테이너는 3000번 포트를 사용하여 서비스를 제공한다.
EXPOSE 3000

ENV PORT 3000

# CMD HOSTNAME=localhost node server.js
CMD node server.js