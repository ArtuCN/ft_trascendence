FROM node:20-alpine

WORKDIR /app

COPY ./ts_frontend/package.json ./ts_frontend/package-lock.json ./

RUN npm install

COPY ./ts_frontend/ .

EXPOSE ${FRONTEND_PORT}

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
