ARG BUILD_FROM=ghcr.io/home-assistant/aarch64-base:latest
FROM ${BUILD_FROM}

# Install Node.js, npm, nginx und jq
RUN apk add --no-cache nodejs npm nginx jq

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

# Production setup
WORKDIR /app/backend
RUN cp -r /build/backend/dist ./dist && \
    cp -r /build/backend/node_modules ./node_modules && \
    cp /build/backend/package.json ./

# Frontend setup (nginx served)
RUN cp -r /build/frontend/dist /var/www/html

# Cleanup build files
RUN rm -rf /build

# Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy run script
COPY run.sh /run.sh
RUN chmod +x /run.sh

# Data directory für Cookie und Presets
RUN mkdir -p /data

EXPOSE 3080 3001

CMD ["/run.sh"]
