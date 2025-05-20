FROM oven/bun:latest

WORKDIR /home/bun/app

COPY package.json ./
COPY bun.lock ./
# RUN bun install
RUN bun install

# Tạo thư mục nếu cần
RUN mkdir -p /home/bun/app/sites-enabled

COPY . .
# ENV NEXT_TELEMETRY_DISABLED 1
RUN bun --bun next build
CMD ["bun", "--bun", "next", "start"]