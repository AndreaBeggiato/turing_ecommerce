FROM node:10-alpine

RUN set -xe \
    && apk add --no-cache git

WORKDIR /home/node/backend

RUN chown -R node:node /home/node/backend

USER node

COPY package.json yarn.lock ./
#COPY package.json ./

RUN yarn install

COPY --chown=node:node . .
