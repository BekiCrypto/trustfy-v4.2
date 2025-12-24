FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY api/package.json ./api/package.json
COPY worker/package.json ./worker/package.json
COPY web/package.json ./web/package.json
COPY shared/package.json ./shared/package.json

RUN npm ci

COPY shared ./shared
COPY worker ./worker

RUN npm run build -w @trustfy/shared
RUN npm run build -w @trustfy/worker

CMD ["npm", "run", "start", "-w", "@trustfy/worker"]
