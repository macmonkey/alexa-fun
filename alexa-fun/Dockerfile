ARG BUILD_FROM=node:20-alpine
FROM ${BUILD_FROM} AS builder

WORKDIR /build

# Frontend bauen
COPY frontend/package*.json ./frontend/
WORKDIR /build/frontend
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend bauen
WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Production stage
FROM ${BUILD_FROM}

# Install nginx und jq
RUN apk add --no-cache nginx jq

# Backend setup
WORKDIR /app/backend
COPY --from=builder /build/backend/dist ./dist
COPY --from=builder /build/backend/node_modules ./node_modules
COPY --from=builder /build/backend/package.json ./

# Frontend setup (nginx served)
COPY --from=builder /build/frontend/dist /var/www/html

# Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy run script
COPY run.sh /run.sh
RUN chmod +x /run.sh

# Data directory für Cookie und Presets
RUN mkdir -p /data

EXPOSE 3080 3001

CMD ["/run.sh"]
