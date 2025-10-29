## multi-stage Dockerfile for apps/frontend
# Build React app and serve with nginx

FROM node:18-alpine AS builder
WORKDIR /app
ENV CI=true

# copy package files first for deps install cache
COPY package.json package-lock.json* yarn.lock* ./

# prefer npm if lockfile missing
RUN if [ -f package-lock.json ]; then npm ci --silent; elif [ -f yarn.lock ]; then yarn --silent --frozen-lockfile; else npm install --silent; fi

# copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
