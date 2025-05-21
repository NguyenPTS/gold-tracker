FROM oven/bun:latest

WORKDIR /home/bun/app

COPY package.json ./
COPY bun.lock ./
RUN bun install

COPY . .

RUN bun --bun next build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Nếu muốn log debug:
# ENV DEBUG=*

CMD ["bun", "--bun", "next", "start", "-H", "0.0.0.0", "-p", "2238"]