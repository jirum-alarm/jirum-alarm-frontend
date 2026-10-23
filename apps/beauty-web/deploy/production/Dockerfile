# 지름알림 뷰티(apps/beauty-web) — jirum-alarm.com/beauty/* (게이트웨이가 /beauty 접두를 이 파드로 보낸다)
# 골격은 apps/ai Dockerfile 과 같다(turbo prune → 이미지 안에서 빌드 → standalone 만 담는 런너).
ARG NODE_VERSION=22.23.4
ARG PNPM_VERSION=10.30.3

FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate && pnpm install turbo --global

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN turbo prune beauty-web --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY .npmrc ./.npmrc
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --filter=beauty-web
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=beauty-web...

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 런타임 env — 이미지를 다시 굽지 않고 gitops(configmap)로 덮는다. 코드는 next-runtime-env 로 실행 시점에 읽는다.
# 기본값은 운영. ⚠️ 빈 기본값(`ARG X` 만)은 ENV 를 빈 문자열로 굽는다 — 코드가 truthy 로 막지만 값은 채워 둔다.
# 서비스명은 crawling-SERVICE-lb(apps/ai Dockerfile 주석의 2026-08-07 실측).
ARG API_URL=http://crawling-service-lb.crawling-server.svc.cluster.local:3100
ARG NEXT_PUBLIC_SERVICE_URL=https://jirum-alarm.com
ENV API_URL=${API_URL} \
    NEXT_PUBLIC_SERVICE_URL=${NEXT_PUBLIC_SERVICE_URL} \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL 은 기본값 없음 — configmap 에만(비면 카톡방 안내를 숨긴다).

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/beauty-web/next.config.ts .
COPY --from=installer /app/apps/beauty-web/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/beauty-web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/beauty-web/.next/static ./apps/beauty-web/.next/static

EXPOSE 3000
CMD ["node", "/app/apps/beauty-web/server.js"]
