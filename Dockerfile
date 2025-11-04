# Combined Dockerfile for frontend + API (single Render service)
# Builds React frontend and NestJS API into one image

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
ENV CI=true
ENV DISABLE_ESLINT_PLUGIN=true

# Copy frontend package files
COPY apps/frontend/package.json apps/frontend/yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile --silent; else npm install --silent; fi

# Copy frontend source and build
COPY apps/frontend ./
RUN npm run build

# Stage 2: Build API
FROM node:20-alpine AS api-builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# Copy root package files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy API package files
COPY apps/api/package.json apps/api/tsconfig.json apps/api/tsconfig.build.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma ./packages/db/prisma

# Install dependencies (including dev deps for build)
RUN pnpm install --prod=false --filter "./apps/api" --filter "./packages/db" || true

# Generate Prisma client
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/cryptoplatform
RUN npx -y prisma generate --schema ./packages/db/prisma/schema.prisma || true

# Copy API source and build
COPY apps/api ./apps/api
RUN pnpm --filter "./apps/api" run build

# Stage 3: Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# Copy API runtime artifacts
COPY --from=api-builder /app/apps/api/dist ./dist
COPY apps/api/package.json ./package.json
COPY --from=api-builder /app/node_modules ./node_modules

# Copy Prisma schema for migrations
COPY packages/db/prisma ./packages/db/prisma

# Copy frontend build into public/ folder (API will serve this)
COPY --from=frontend-builder /app/frontend/build ./public

# Expose port (Render will set PORT env)
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Run migrations then start API
CMD ["sh", "-c", "npx prisma migrate deploy --schema ./packages/db/prisma/schema.prisma || true && node dist/main.js"]
