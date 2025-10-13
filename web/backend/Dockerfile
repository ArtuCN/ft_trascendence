FROM node:20-bullseye

WORKDIR /app

COPY package.json ./
RUN npm install
RUN npm rebuild

COPY . .

RUN mkdir -p /app/data

EXPOSE 3000

# Inizializza il database prima di avviare il server
CMD ["sh", "-c", "node init-db.js && node srcs/server.js"]