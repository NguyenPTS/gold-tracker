FROM oven/bun:latest

WORKDIR /home/bun/app

COPY package.json ./
COPY bun.lock ./
# RUN bun install
RUN bun install

COPY . .

# Tạo thư mục sau khi copy code


# ENV NEXT_TELEMETRY_DISABLED 1
RUN bun --bun next build
ENV NODE_ENV=production
CMD ["bun", "--bun", "next", "start", "-H", "0.0.0.0", "-p", "2238"]