FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

RUN npm install -g typescript ts-node

COPY tsconfig.json ./

COPY src ./src

### COPY env_example_docker.txt ./.env

COPY index.html ./index.html

RUN tsc

EXPOSE 4555

# For development with reload: CMD ["ts-node", "src/lib/index.ts"]
CMD ["node", "dist/lib/index.js"]
