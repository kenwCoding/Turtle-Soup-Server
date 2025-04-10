FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

# Add build step
RUN yarn tsc

EXPOSE 4001

# Use a specific non-root user
USER node

CMD ["yarn", "start"]