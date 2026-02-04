# Multi-stage build: frontend + backend em uma única imagem

# 1) Build do frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Instalar dependências do frontend
COPY frontend/package*.json ./
RUN npm ci --production=false

# Build-time args opcionais
ARG VITE_API_URL
ARG VITE_DEFAULT_START
ARG VITE_DEFAULT_END
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DEFAULT_START=${VITE_DEFAULT_START}
ENV VITE_DEFAULT_END=${VITE_DEFAULT_END}

# Copiar código do frontend e gerar dist
COPY frontend/ .
RUN npm run build

# 2) Build do backend e empacotamento final
FROM node:20-alpine AS app
WORKDIR /app

# Copiar backend package e instalar deps de produção
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copiar código do backend
COPY backend/ ./backend/

# Copiar build do frontend para o backend/public
RUN mkdir -p backend/public
COPY --from=frontend-build /app/dist/ ./backend/public/

# Porta para Cloud Run ($PORT) e local
ENV PORT=8000
EXPOSE 8000

# Ajustar comando para respeitar $PORT (default 8000)
WORKDIR /app/backend
CMD ["sh", "-lc", "PORT=${PORT:-8000} node src/index.js"]
