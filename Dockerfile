FROM node:16-alpine
RUN apk update --no-cache

WORKDIR /bot
VOLUME /bot

COPY package.json .
COPY yarn.lock .

RUN yarn install

CMD ["yarn", "start"]
