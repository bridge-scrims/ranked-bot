FROM node:lts-alpine

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build
RUN npm run test

ENTRYPOINT [ "node", "." ]