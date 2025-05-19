# Stage 1: Build the application
FROM node:18-alpine

# Set working directory
WORKDIR /app
# Define arguments
ARG PROJECT_NAME
ARG PORT_PROGRAM
# Set environment variable
ENV PROJECT=${PROJECT_NAME}
ENV PORT_PROGRAM=${PORT_PROGRAM}
# Install app dependencies
COPY . .
RUN npm install --force
RUN bun --bun next build
CMD bun run start
