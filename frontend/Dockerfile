FROM node:20-alpine AS build
WORKDIR /app

# Instalando dependências usando package-lock / npm ci é mais determinístico
COPY package*.json ./
RUN npm ci --production=false

# Build args para injetar variáveis Vite (compiladas em tempo de build)
ARG VITE_API_URL
ARG VITE_DEFAULT_START
ARG VITE_DEFAULT_END
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DEFAULT_START=${VITE_DEFAULT_START}
ENV VITE_DEFAULT_END=${VITE_DEFAULT_END}

# Copia o restante do código e gera o build do Vite
COPY . .
RUN npm run build

# Fase final: servir com nginx (small, estável)
FROM nginx:stable-alpine
# Remove conteúdo default e copia build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuração para fallback de SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;", "npm"]
