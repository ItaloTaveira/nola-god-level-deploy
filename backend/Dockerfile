### Multi-stage Dockerfile: build frontend then backend
### Build context must be the repository root so the frontend folder is available.

FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
# Allow passing VITE_API_URL as a build-time or environment variable
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM node:20-slim
WORKDIR /app

# Install only production deps for the backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production --silent

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend's public directory
COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 8000
CMD ["npm", "start"]
