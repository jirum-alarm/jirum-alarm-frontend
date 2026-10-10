# 실행 전용 이미지 — Next 빌드는 워크플로(러너)에서 .next/cache·pnpm store 를 보존하며 하고, 여기선 standalone 결과만 담는다.
# (이전: 이미지 안에서 빌드 → 호스티드 러너는 매번 새 VM 이라 컴파일 캐시가 늘 비어 있었다)
# ★glibc(slim) 필수: 러너(ubuntu)에서 설치된 sharp 네이티브 바이너리가 standalone 에 실린다.
#   alpine(musl) 이면 sharp 가 안 떠서 /_next/image 이미지 최적화가 깨진다.
FROM node:22.18-slim

# libjemalloc2: glibc malloc 대신 jemalloc 으로 돌린다(아래 LD_PRELOAD). 경로를 아키텍처와 무관하게 고정하려고 심볼릭 링크.
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init libjemalloc2 && rm -rf /var/lib/apt/lists/* && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    test -e /usr/local/lib/libjemalloc.so

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

# glibc 는 스레드마다 malloc 아레나를 만든다. sharp(libvips) 스레드가 아레나를 단편화해 RSS 가 10~15분 만에
# 1Gi 까지 불어 OOMKill 반복(2026-10-10, 아레나 49개 703MiB 실측) → 아레나 수를 묶는다. alpine(musl)엔 없던 문제.
ENV MALLOC_ARENA_MAX=2
# 아레나를 2개로 묶어도 메인 아레나(brk 힙)가 단편화로 계속 자라 working set 이 시간당 ~30MiB 씩 올랐다
# (2026-10-11: 15시간 만에 470→880MiB, 1Gi limit OOMKill 재발 — smaps 상 [heap] 275MiB+보조 아레나 64MiB 가 V8 157MiB 보다 큼).
# sharp(libvips) 문서가 glibc 리눅스에 권하는 대로 jemalloc 을 쓴다. 되돌리려면 gitops values 에서 LD_PRELOAD="" 로 덮는다.
ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so

USER nextjs

# context = apps/web (runtime.Dockerfile.dockerignore 가 빌드 산출물만 통과시킨다)
COPY --chown=nextjs:nodejs next.config.js package.json ./
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./apps/web/.next/static
COPY --chown=nextjs:nodejs public ./apps/web/public

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/web/server.js"]
