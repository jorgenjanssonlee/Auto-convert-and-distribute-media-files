FROM node:18-alpine

WORKDIR /app
COPY ./app/package.json .
COPY ./app/package-lock.json .
RUN npm install
COPY ./app/ .
CMD [ "node", "compare-trakt-and-radarr.js" ]