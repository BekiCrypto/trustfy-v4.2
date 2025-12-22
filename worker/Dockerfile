FROM node:20-alpine

WORKDIR /usr/src/worker

COPY worker/package*.json ./
COPY worker/tsconfig*.json ./
COPY worker/src ./src
COPY shared/src/contracts ../shared/src/contracts

RUN npm install
RUN npm run build

CMD ["node", "dist/index.js"]
