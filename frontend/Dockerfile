### Builder
FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock* package-lock.json* ./
RUN bun install

COPY . .

FROM builder AS test
RUN bun run test

FROM builder AS build
RUN bun run build

### Production image
FROM nginx:alpine AS production
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
