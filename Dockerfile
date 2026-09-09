FROM node:lts-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Inject the git commit at build time so /version works in the image
# (the .git directory is not copied into the image).
ARG GIT_COMMIT
ARG GIT_COMMIT_SUBJECT
ARG GIT_COMMIT_AUTHORED_ON
ARG GIT_COMMIT_COMMITTED_ON
ENV GIT_COMMIT=$GIT_COMMIT \
    GIT_COMMIT_SUBJECT=$GIT_COMMIT_SUBJECT \
    GIT_COMMIT_AUTHORED_ON=$GIT_COMMIT_AUTHORED_ON \
    GIT_COMMIT_COMMITTED_ON=$GIT_COMMIT_COMMITTED_ON

# Install dependencies first for better layer caching
# --loglevel=error suppresses upstream ERESOLVE peer-dep warnings
# (babel-preset-current-node-syntax declares @babel/core ^7, project uses 8)
COPY package*.json ./
RUN npm ci --omit=dev --loglevel=error && npm cache clean --force

COPY *.js ./

# Run as non-root user
USER node

EXPOSE 13080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:13080/ >/dev/null 2>&1 || exit 1

CMD [ "node", "server.js" ]
