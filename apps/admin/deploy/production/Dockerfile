ARG NODE_VERSION=22.18
ARG PNPM_VERSION=10.30.3
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine AS alpine

# setup pnpm on the alpine base
FROM alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN pnpm install turbo --global

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app
COPY . .
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "admin" is the name entered in the project's package.json: { name: "admin" }
RUN turbo prune admin --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY .npmrc ./.npmrc
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --filter=admin
 
# Build the project
COPY --from=builder /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ARG NODE_ENV=production

RUN pnpm turbo run build --filter=admin...
 
FROM base AS runner
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NODE_ENV=${NODE_ENV}
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
COPY --from=installer /app/apps/admin/next.config.mjs .
COPY --from=installer /app/apps/admin/package.json .
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public
 
CMD node apps/admin/server.js
