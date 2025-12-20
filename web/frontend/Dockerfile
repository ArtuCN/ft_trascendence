FROM node:20-alpine

WORKDIR /app

COPY ./ts_frontend/package.json ./

RUN npm install

COPY ./ts_frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
