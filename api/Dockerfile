FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY api/package.json ./api/package.json
COPY worker/package.json ./worker/package.json
COPY web/package.json ./web/package.json
COPY shared/package.json ./shared/package.json

RUN npm ci

COPY shared ./shared
COPY api ./api

RUN npm run build -w @trustfy/shared
RUN npm run prisma:generate -w @trustfy/api
RUN npm run build -w @trustfy/api

EXPOSE 4000

CMD ["npm", "run", "start", "-w", "@trustfy/api"]
