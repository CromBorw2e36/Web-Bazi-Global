# Bát Tự — bazi.sincely.io.vn
#
# Mirrors the BuilderCMS web-client image: node:22-alpine, Next.js standalone
# output, non-root runtime. The one structural difference is Prisma's.
#
# Migrations run from their own `migrator` stage rather than from the app
# container. The Prisma CLI pulls in a dependency graph of its own — @prisma/
# config alone needs `effect` — and hand-picking node_modules subtrees into a
# standalone runtime image fails one missing transitive dep at a time. Keeping
# the builder tree intact for that one job is both correct and smaller: the app
# image stays lean, and the migrator is short-lived and shares every layer with
# the build.

# ─── Stage 1: dependencies ──────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ─── Stage 2: build ─────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# src/generated/prisma is gitignored, so it has to be produced here — without
# this the build fails on the first import of the client.
#
# DATABASE_URL is set even though generate never connects: prisma.config.ts
# resolves it while loading, and without it generate dies with
# "PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL".
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    npx prisma generate

# next build wants these present even though it never connects to anything.
# They are set inline on the command rather than as ARG or ENV so they stay
# shell-scoped to this one RUN: nothing named like a secret becomes an image
# layer or a build argument. The container gets its real values from compose.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    AUTH_SECRET="build-time-placeholder-never-used-at-runtime" \
    npm run build

# ─── Stage 3: migration runner ──────────────────────────────
# Runs to completion before the app starts, then exits. `migrate deploy` only
# plays forward through the committed migration files — it never generates,
# resets, or drops anything — so re-running it on every deploy is safe.
FROM builder AS migrator
CMD ["npx", "prisma", "migrate", "deploy"]

# ─── Stage 4: runtime ───────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
