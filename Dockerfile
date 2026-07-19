# --- deps: install project dependencies ---
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./

# Install dependencies without requiring bun.lock to match exactly
RUN bun install

# --- build: compile the TanStack Start app ---
FROM oven/bun:1 AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# --- runtime ---
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
