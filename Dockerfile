FROM node:20-slim


WORKDIR /app

ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production

COPY backend/ ./

EXPOSE 8000
CMD ["npm", "start"]
