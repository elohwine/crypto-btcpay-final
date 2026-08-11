## multi-stage Dockerfile for apps/frontend
# Build React app and serve with nginx

FROM node:20-alpine AS builder
WORKDIR /app
ENV CI=true
ENV DISABLE_ESLINT_PLUGIN=true

# copy package files first for deps install cache
COPY package.json package-lock.json* yarn.lock* ./

# prefer npm if lockfile missing
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; elif [ -f yarn.lock ]; then yarn install; else npm install --no-audit --no-fund; fi

# copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
