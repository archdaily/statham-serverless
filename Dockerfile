FROM node:4.3.2

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.7.5
RUN npm install --global aws-sdk
RUN npm link aws-sdk
RUN npm install --global lambda-local
RUN npm link lambda-local
RUN npm install --global body-parser
RUN npm link body-parser

ENV HOME=/home/app

USER app
WORKDIR $HOME

COPY . /home/app

RUN npm install

CMD ["npm","start"]
