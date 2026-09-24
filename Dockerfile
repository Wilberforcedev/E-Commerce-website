# =============================================================================
# Stage 1: Build Frontend SPA
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (leverage cache layers)
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle (Vite + TypeScript)
COPY . .
RUN npm run build

# =============================================================================
# Stage 2: Production Runtime
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server code, configuration, and app metadata
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Use non-root node user for container security
USER node

# Expose server port
EXPOSE 3000

# Health check via /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production Node + Express server
CMD ["npm", "start"]
