FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache typescript
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install -g http-server

COPY . .

RUN tsc

EXPOSE 8000

CMD ["http-server", "-p", "8000"]
