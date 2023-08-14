FROM oven/bun:latest

RUN apk add --no-cache libc6-compat && apk update

WORKDIR /bot

COPY --link . .
RUN bun install

CMD ["bun", "bot.ts"]
