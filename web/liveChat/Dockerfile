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

# (check .env or readme for port if it changed)
EXPOSE 4555

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  # CMD node -e "require('http').get('http://localhost:4555/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# For development with reload: CMD ["ts-node", "src/lib/index.ts"]
CMD ["node", "dist/lib/index.js"]
