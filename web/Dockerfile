FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY api/package.json ./api/package.json
COPY worker/package.json ./worker/package.json
COPY web/package.json ./web/package.json
COPY shared/package.json ./shared/package.json

RUN npm ci

COPY shared ./shared
COPY web ./web

EXPOSE 5173

CMD ["npm", "run", "dev", "-w", "@trustfy/web", "--", "--host", "0.0.0.0", "--port", "5173"]
