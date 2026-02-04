FROM node:20-slim
WORKDIR /app

# Instala somente dependências de produção
COPY package.json package-lock.json* ./
RUN npm install --production --silent

# Copia o código do backend
COPY . .

ENV NODE_ENV=production
EXPOSE 8000
CMD ["npm", "start"]
