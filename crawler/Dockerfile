FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget chromium nss freetype freetype-dev harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /app/websites && chown -R node:node /app/websites

USER node

CMD ["node", "index.js"] 