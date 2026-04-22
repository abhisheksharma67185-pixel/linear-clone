FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.1 --activate

# ── Install dependencies ──
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/thetabench-core/package.json ./packages/thetabench-core/
COPY sites/shopify-admin/package.json ./sites/shopify-admin/
RUN pnpm install --frozen-lockfile --filter shopify-admin-sim... --filter @thetabench/core...

# ── Build ──
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/thetabench-core ./packages/thetabench-core
COPY --from=deps /app/sites/shopify-admin/node_modules ./sites/shopify-admin/node_modules
COPY . .
RUN pnpm --filter @thetabench/core run build
RUN pnpm --filter shopify-admin-sim run build

# ── Production runner ──
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/sites/shopify-admin/.next/standalone ./
COPY --from=builder /app/sites/shopify-admin/.next/static ./sites/shopify-admin/.next/static
COPY --from=builder /app/sites/shopify-admin/public ./sites/shopify-admin/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "sites/shopify-admin/server.js"]
