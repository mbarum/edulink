# ==============================================================================
# Multi-Stage Production Dockerfile for SaaSLink Backend API
# Enterprise-grade, hardened Alpine runtime with non-root user execution
# ==============================================================================

# Stage 1: Build & Compilation
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Compile production NestJS distribution
RUN npm run build:server

# Stage 2: Production Execution Runtime
FROM node:20-alpine AS runner

# Install dumb-init for proper PID 1 signal forwarding and curl for health checks
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy compiled artifacts from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/scripts ./scripts

# Create uploads directory and enforce unprivileged user ownership
RUN mkdir -p /usr/src/app/public/uploads && \
    chown -R node:node /usr/src/app

USER node

EXPOSE 3000

# Container health monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
