#Game logic
FROM node:20-alpine

WORKDIR /game

COPY ./package.json ./package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3005

CMD ["npm", "test", "--host", "0.0.0.0"]

