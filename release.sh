#!/bin/sh
set -e

# Install only the needed workspace packages (API and DB)
corepack enable && corepack prepare pnpm@9.6.0 --activate
pnpm install --prod=false --filter "./apps/api" --filter "./packages/db"

# Run Prisma migration
pnpm exec prisma migrate deploy --schema packages/db/prisma/schema.prisma
