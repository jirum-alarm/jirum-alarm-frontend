# 실행 전용 이미지 — Next 빌드는 워크플로(러너)에서 .next/cache·pnpm store 를 보존하며 하고, 여기선 standalone 결과만 담는다.
# (이전: 이미지 안에서 빌드 → 호스티드 러너는 매번 새 VM 이라 컴파일 캐시가 늘 비어 있었다)
# ★glibc(slim) 필수: 러너(ubuntu)에서 설치된 sharp 네이티브 바이너리가 standalone 에 실린다.
#   alpine(musl) 이면 sharp 가 안 떠서 /_next/image 이미지 최적화가 깨진다.
FROM node:22.18-slim

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs && \
    mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

# 빌드에 쓴 값과 같은 값을 런타임 env 로도 둔다(next-runtime-env 가 읽음) — 워크플로가 build-args 로 넘긴다.
ARG NEXT_PUBLIC_SERVICE_URL
ARG API_URL
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID
ARG NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL
ARG NEXT_PUBLIC_ADSENSE_SLOT_SEARCH_INFEED
ARG NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL_SIDE
ARG NODE_ENV=production
ENV NEXT_PUBLIC_SERVICE_URL=${NEXT_PUBLIC_SERVICE_URL} \
    API_URL=${API_URL} \
    NEXT_PUBLIC_FIREBASE_VAPID_KEY=${NEXT_PUBLIC_FIREBASE_VAPID_KEY} \
    NEXT_PUBLIC_ADSENSE_CLIENT_ID=${NEXT_PUBLIC_ADSENSE_CLIENT_ID} \
    NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL=${NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL} \
    NEXT_PUBLIC_ADSENSE_SLOT_SEARCH_INFEED=${NEXT_PUBLIC_ADSENSE_SLOT_SEARCH_INFEED} \
    NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL_SIDE=${NEXT_PUBLIC_ADSENSE_SLOT_PRODUCT_DETAIL_SIDE} \
    NODE_ENV=${NODE_ENV} \
    PORT=3000

USER nextjs

# context = apps/web (runtime.Dockerfile.dockerignore 가 빌드 산출물만 통과시킨다)
COPY --chown=nextjs:nodejs next.config.js package.json ./
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./apps/web/.next/static
COPY --chown=nextjs:nodejs public ./apps/web/public

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/web/server.js"]
