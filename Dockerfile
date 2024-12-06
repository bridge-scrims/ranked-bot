FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install
ENTRYPOINT ["bun", "."]