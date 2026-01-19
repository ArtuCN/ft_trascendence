FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache typescript \
 && npm install -g typescript ts-node http-server

COPY . .

RUN tsc

EXPOSE $GAMEPLAY_PORT

CMD ["sh", "-c", "http-server -p $GAMEPLAY_PORT"]