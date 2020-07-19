FROM node:14.5.0-alpine3.10

WORKDIR /var/www

COPY ./src /var/www

RUN npm install -g nodemon
RUN npm install

EXPOSE 8080

CMD npm start
