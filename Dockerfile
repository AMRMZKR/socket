# for development usage
FROM node:14-alpine3.14 as local

WORKDIR /usr/src/app

EXPOSE 4040

COPY ./server/package.json /usr/src/app/

RUN npm install --loglevel --verbose

COPY ./server .

ENTRYPOINT ["/bin/sh", "-c", "npm run dev"]
# for development usage
FROM node:14-alpine3.14 as production

WORKDIR /usr/src/app

EXPOSE 4040

COPY ./server/package.json /usr/src/app/

RUN npm install 

COPY ./server .

ENTRYPOINT ["/bin/sh", "-c", "npm run start"]
