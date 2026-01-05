# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (env vars are baked in at build time)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a script to inject runtime environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-env-vars.sh && \
    echo 'if [ -n "$VITE_API_URL" ]; then' >> /docker-entrypoint.d/40-env-vars.sh && \
    echo '  echo "window.ENV = { VITE_API_URL: \"$VITE_API_URL\" };" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.d/40-env-vars.sh && \
    echo 'fi' >> /docker-entrypoint.d/40-env-vars.sh && \
    chmod +x /docker-entrypoint.d/40-env-vars.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

