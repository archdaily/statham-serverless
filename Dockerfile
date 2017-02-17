FROM node:4.3.2

RUN apt-get install git
RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.7.5
RUN npm install --global aws-sdk
RUN npm link aws-sdk
RUN git clone https://github.com/ashiina/lambda-local
RUN cd lambda-local && npm install -g lambda-local

ENV HOME=/home/app

USER app
WORKDIR $HOME

COPY . /home/app

RUN npm install

CMD ["lambda-local", "-l", "handlers/receiver.js", "-h", "receiveAndSendMessage", "-e", "test-event.js"]
