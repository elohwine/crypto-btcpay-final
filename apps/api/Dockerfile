FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app/apps/api

COPY apps/api/package.json ./package.json
COPY apps/api/tsconfig.json ./tsconfig.json
COPY apps/api/tsconfig.build.json ./tsconfig.build.json

RUN npm install --no-audit --no-fund

WORKDIR /app
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma
COPY packages/db/prisma ./packages/db/prisma

ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/cryptoplatform

WORKDIR /app/apps/api
RUN npx prisma generate --schema /app/packages/db/prisma/schema.prisma
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app/apps/api

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY apps/api/package.json ./package.json
COPY packages/db/prisma /app/packages/db/prisma

EXPOSE 3001

CMD ["node", "dist/main.js"]
