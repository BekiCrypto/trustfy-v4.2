FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src

RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]
