FROM node:10-alpine

WORKDIR /home/node/frontend

RUN chown -R node:node /home/node/frontend

USER node

COPY package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node . .
