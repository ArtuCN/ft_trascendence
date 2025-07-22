FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache typescript
RUN npm install -g typescript
RUN npm install -g ts-node

COPY . .

RUN tsc

RUN npm install -g http-server


EXPOSE 8081


CMD ["http-server", "-p", "8081"]
