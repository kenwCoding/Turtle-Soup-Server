FROM node:20-alpine

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN yarn

COPY . .

EXPOSE 4001

CMD ["yarn", "start"]
