FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src
USER node

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
