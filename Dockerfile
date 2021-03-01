FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY server.js server.js

EXPOSE 13080
CMD [ "node", "server.js" ]
