FROM oven/bun:latest

WORKDIR /bot

COPY --link . .
RUN bun install

CMD ["bun", "bot.ts"]
