FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./
RUN npm install

COPY . .

# Créer le dossier websites et définir les permissions
RUN mkdir -p /app/websites && chown -R node:node /app/websites

USER node

CMD ["node", "index.js"] 