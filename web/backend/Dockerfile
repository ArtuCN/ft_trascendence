FROM node:20-bullseye

WORKDIR /app

COPY package.json ./
RUN npm install
RUN npm rebuild

COPY . .

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "srcs/server.js"]