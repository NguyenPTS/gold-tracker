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
CMD ["npm", "run", "start"]
# Nếu dùng yarn:
# CMD ["yarn", "start"]
# Nếu muốn log rõ ràng hơn, có thể thêm script start trong package.json:
# "start": "NODE_ENV=production next start -p 3000"