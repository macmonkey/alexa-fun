# Build stage für Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build stage für Backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

# Install nginx für Frontend
RUN apk add --no-cache nginx

# Backend setup
WORKDIR /app/backend
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY backend/package.json ./

# Frontend setup (nginx served)
COPY --from=frontend-build /app/frontend/dist /var/www/html

# Nginx config
COPY ha-addon/nginx.conf /etc/nginx/http.d/default.conf

# Copy run script
COPY ha-addon/run.sh /run.sh
RUN chmod +x /run.sh

# Data directory für Cookie und Presets
RUN mkdir -p /data

EXPOSE 3080 3001

CMD ["/run.sh"]
