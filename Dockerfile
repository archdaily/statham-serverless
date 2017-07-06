FROM node:4.3.2

RUN npm install --global npm@3.7.5
RUN npm install --global aws-sdk express body-parser
RUN npm link aws-sdk
RUN npm link body-parser
RUN npm link express

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN rm -Rf node_modules
RUN npm install

CMD ["npm", "start"]
