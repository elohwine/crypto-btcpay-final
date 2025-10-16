FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate
COPY apps/api/package.json apps/api/tsconfig.json apps/api/tsconfig.build.json ./
COPY packages/db/prisma ./packages/db/prisma
COPY apps/api ./apps/api
# Install including dev deps for build and prisma generate
RUN pnpm install --prod=false --filter "./apps/api" --filter "./packages/db" || true
# Generate Prisma client into node_modules/.pnpm/@prisma+client...
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/cryptoplatform
RUN npx -y prisma generate --schema ./packages/db/prisma/schema.prisma || true
# Build NestJS
RUN pnpm --filter "./apps/api" run build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate
# Copy built app and runtime package.json
COPY --from=base /app/apps/api/dist ./dist
COPY apps/api/package.json ./package.json
# Copy node_modules from builder to retain @prisma/client generated files
COPY --from=base /app/node_modules ./node_modules
# Copy Prisma schema/migrations so we can run migrate at runtime
COPY packages/db/prisma ./packages/db/prisma
EXPOSE 3001
# Run Prisma migrations before starting the app (safe if already up-to-date)
CMD ["sh","-lc","npx prisma migrate deploy --schema ./packages/db/prisma/schema.prisma || true; node dist/main.js"]
