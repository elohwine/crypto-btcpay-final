# Combined Dockerfile for frontend + API (single Render service)
# Builds React frontend and NestJS API into one image

# Stage 1: Build frontend (use pnpm workspace to keep package manager consistent)
FROM node:20-bookworm AS frontend-builder
WORKDIR /app
ENV CI=true
ENV DISABLE_ESLINT_PLUGIN=true

# Copy root pnpm workspace files so pnpm can operate correctly
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package manifest
COPY apps/frontend/package.json ./apps/frontend/package.json

# Enable corepack and install frontend deps using pnpm (workspace-aware)
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate \
	&& pnpm install --frozen-lockfile --filter ./apps/frontend --silent

# Copy frontend source and build
COPY apps/frontend ./apps/frontend
RUN pnpm --filter ./apps/frontend run build

# Stage 2: Build API
FROM node:20-bookworm AS api-builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# Copy root package files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy API package files
COPY apps/api/package.json apps/api/tsconfig.json apps/api/tsconfig.build.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma ./packages/db/prisma

# Install dependencies (including dev deps for build)
RUN pnpm install --prod=false --filter "./apps/api" --filter "./packages/db"

# Generate Prisma client
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/cryptoplatform
RUN cd packages/db && pnpm exec prisma generate

# Copy API source and build
COPY apps/api ./apps/api
RUN pnpm --filter "./apps/api" run build

# Stage 3: Runtime image
FROM node:20-bookworm AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# Copy package files and install deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
# Install with dev dependencies so prisma CLI is available
RUN pnpm install --prod=false --filter "./apps/api" --filter "./packages/db"

# Copy API runtime artifacts to their original package path
RUN mkdir -p ./apps/api/dist
COPY --from=api-builder /app/apps/api/dist ./apps/api/dist

# Copy Prisma schema for migrations
COPY packages/db/prisma ./packages/db/prisma

	# Copy frontend build into API's public/ folder (ServeStaticModule expects ../public from dist)
	RUN mkdir -p ./apps/api/public
	# frontend build output is at /app/apps/frontend/build when using workspace layout
	COPY --from=frontend-builder /app/apps/frontend/build ./apps/api/public

# Expose port (Render will set PORT env)
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Generate Prisma client at runtime (ensures .prisma/client exists), then start API
CMD ["sh", "-c", "cd /app/apps/api && pnpm exec prisma generate --schema ../../packages/db/prisma/schema.prisma && node /app/apps/api/dist/main.js"]
