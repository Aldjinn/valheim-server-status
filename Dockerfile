FROM node:24-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY *.js ./

# Run as non-root user
USER node

EXPOSE 13080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:13080/ >/dev/null 2>&1 || exit 1

CMD [ "node", "server.js" ]
