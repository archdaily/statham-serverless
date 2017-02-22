FROM node:4.3.2

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.7.5
RUN npm install --global aws-sdk express body-parser
RUN npm link aws-sdk
RUN npm link body-parser
RUN npm link express

ENV HOME=/home/app

USER app
WORKDIR $HOME

COPY . /home/app
RUN npm install

CMD ["npm", "start"]
