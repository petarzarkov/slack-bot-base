FROM node:16.15.1-alpine3.11 AS base
RUN apk add --no-cache \
              bash \
              dumb-init && \
    npm -g install npm@^7.24.2 && \
    npm config set script-shell "/bin/bash" && \
    npm config set update-notifier false

FROM base AS build
USER node
COPY --chown=node:node cas-bot /app/
WORKDIR /app/
RUN npm install && npm run bnw && npm prune production

FROM build AS final
ARG SERVICE_PORT
ARG GIT_BRANCH
ARG GIT_COMMIT
ENV GIT_BRANCH=$GIT_BRANCH \
    GIT_COMMIT=$GIT_COMMIT \
    VERSION=$VERSION \
    SERVICE_PORT=$SERVICE_PORT
WORKDIR /app/
EXPOSE $SERVICE_PORT
CMD ["npm", "start"]
