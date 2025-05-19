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
RUN npm run giavang:build
COPY .env .env
# Expose the port the app runs on
EXPOSE ${PORT_PROGRAM}
CMD ["sh", "-c", "node dist/apps/${PROJECT}/main.js"]