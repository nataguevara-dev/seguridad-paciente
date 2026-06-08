FROM oven/bun:latest AS base
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential python3 pkg-config libsqlite3-dev git ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json bunfig.toml ./
RUN bun install

COPY . .

FROM base AS test
RUN bun run test

FROM base AS production
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE ${PORT}

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s CMD wget -qO- http://localhost:${PORT}/healthz || exit 1

CMD ["bun", "index.ts"]
