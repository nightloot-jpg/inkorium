# --- deps: install exactly what's in bun.lock ---
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# --- build: compile the TanStack Start app (nitro -> node-server preset) ---
FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# VITE_* vars are baked in at build time; .env is committed in this repo.
RUN bun run build

# --- runtime: only the compiled server + assets, run with node ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
