FROM oven/bun:latest

WORKDIR /home/bun/app

COPY package.json ./
COPY bun.lock ./
# RUN bun install
RUN bun install

COPY . .

# Tạo thư mục sau khi copy code
RUN mkdir -p /home/bun/app/sites-enabled

# ENV NEXT_TELEMETRY_DISABLED 1
RUN bun --bun next build
CMD ["bun", "--bun", "next", "start"]