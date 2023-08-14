FROM node:lts-alpine AS installer
RUN apk add --no-cache libc6-compat && apk update
RUN corepack enable && corepack prepare --activate pnpm@latest && pnpm config set store-dir .pnpm-store

WORKDIR /bot

COPY --link . .
RUN pnpm install && pnpm build

CMD ["node", "bot.js"]
