ARG NODE_VERSION=22.18
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
RUN turbo prune ai --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY .npmrc ./.npmrc
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --filter=ai
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=ai...

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# GraphQL 엔드포인트는 런타임 env — 이미지를 재빌드하지 않고 prod/dev 를 가른다.
ARG GRAPHQL_ENDPOINT
ENV GRAPHQL_ENDPOINT=${GRAPHQL_ENDPOINT}

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/ai/next.config.ts .
COPY --from=installer /app/apps/ai/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/ai/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/ai/.next/static ./apps/ai/.next/static

CMD ["node", "/app/apps/ai/server.js"]
