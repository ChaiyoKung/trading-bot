# Trading Bot

## Getting Started

> This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

Install dependencies

```bash
bun install
```

Run in development mode

```bash
bun run dev
bun run dev:watch
```

Run in production mode

```bash
docker compose up
docker compose up --build
```

Build and push docker image to GitHub Container Registry

> Learn more about [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

```bash
docker build -t trading-bot .
docker tag trading-bot ghcr.io/chaiyokung/trading-bot:latest

# docker login ghcr.io
docker push ghcr.io/chaiyokung/trading-bot:latest
```
