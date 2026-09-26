FROM node:22-bookworm-slim

WORKDIR /app

COPY backend/package.json backend/package-lock.json backend/
RUN npm ci --prefix backend --omit=dev

COPY index.html index.js style.css ./
COPY backend backend

WORKDIR /app/backend
EXPOSE 3000

CMD ["node", "server.js"]
