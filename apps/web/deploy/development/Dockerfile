# Build arguments
ARG NODE_VERSION=22.18
ARG PNPM_VERSION=10.14.0

# ========================================
# Base stage - Setup Node.js and pnpm
# ========================================
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS base

# Install pnpm globally with specific version for consistency
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG PNPM_VERSION

RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm install -g turbo && \
    # Clean up package manager cache
    rm -rf /root/.npm /root/.pnpm-store

# ========================================
# Dependencies stage - Install production deps
# ========================================
FROM base AS deps
WORKDIR /app

# Install build dependencies and apply security updates
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache libc6-compat python3 make g++ && \
    rm -rf /var/cache/apk/*

# Copy dependency files only
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter=web...

# ========================================
# Builder stage - Build the application
# ========================================
FROM base AS builder
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Copy source code
COPY . .

ARG NEXT_PUBLIC_SERVICE_URL=https://dev.jirum-alarm.com
ARG API_URL=http://crawling-service-lb.crawling-server.svc.cluster.local:3100
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY=AIzaSyCpfnPqj8e_uVFTASlpumCYJ9w7R3d-8wQ
ARG NODE_ENV=test

# Build the application with cache mount
RUN --mount=type=cache,id=turbo,target=/app/.turbo \
    pnpm turbo run build --filter=web... && \
    # Clean up unnecessary files
    rm -rf apps/web/.next/cache

# ========================================
# Pruner stage - Prepare production files
# ========================================
FROM base AS pruner
WORKDIR /app

# Copy built application
COPY --from=builder /app .

# Prune dev dependencies and prepare standalone build
RUN turbo prune web --docker && \
    cd apps/web && \
    # Remove development files
    find . -name "*.test.*" -delete && \
    find . -name "*.spec.*" -delete && \
    find . -name "*.stories.*" -delete && \
    find . -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find . -name "__mocks__" -type d -exec rm -rf {} + 2>/dev/null || true

# ========================================
# Runner stage - Production image
# ========================================
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Install dumb-init and apply security updates for runtime image
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user with specific UID/GID
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    # Create necessary directories with correct permissions
    mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

ARG NEXT_PUBLIC_SERVICE_URL=https://dev.jirum-alarm.com
ARG API_URL=http://crawling-service-lb.crawling-server.svc.cluster.local:3100
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY=AIzaSyCpfnPqj8e_uVFTASlpumCYJ9w7R3d-8wQ
ARG NODE_ENV=test
ENV NEXT_PUBLIC_SERVICE_URL=${NEXT_PUBLIC_SERVICE_URL} \
    API_URL=${API_URL} \
    NEXT_PUBLIC_FIREBASE_VAPID_KEY=${NEXT_PUBLIC_FIREBASE_VAPID_KEY} \
    NODE_ENV=${NODE_ENV} \
    PORT=3000

# Switch to non-root user
USER nextjs

# Copy production files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/web/server.js"]