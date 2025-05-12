ARG NODE_VERSION=22.15

FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS base

# Setup pnpm on the base image
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && pnpm install turbo --global

# Prepare the build
FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app
COPY . .
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune landing --docker

# Install dependencies for isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --filter=landing

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=landing...

# Set up the runner environment
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/landing/next.config.js .
COPY --from=installer /app/apps/landing/package.json .

# Automatically leverage output traces to reduce image size
COPY --from=installer --chown=nextjs:nodejs /app/apps/landing/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/landing/public ./apps/landing/public

CMD ["node", "/app/apps/landing/server.js"]