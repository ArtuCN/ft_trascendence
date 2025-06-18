FROM node:20-alpine

WORKDIR /app

COPY ./react_frontend/package.json ./react_frontend/package-lock.json ./

RUN npm install

COPY ./react_frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
