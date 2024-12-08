FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install
RUN bun run test

ENTRYPOINT ["bun", "."]