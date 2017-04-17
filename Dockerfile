FROM node:6.10.2-alpine

ENV PORT 3000

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY src ./src

EXPOSE $PORT

RUN npm run build

CMD [ "npm", "start" ]
