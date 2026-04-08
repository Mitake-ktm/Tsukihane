FROM node:20-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copie des fichiers de build
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript -> JavaScript
RUN npm run build

# Lancement du bot
CMD ["npm", "run", "start"]
