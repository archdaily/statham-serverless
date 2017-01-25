'use strict';

class Message {

  constructor(message) {

      this.method   = message.method;
      this.body     = message.body;
      this.url      = message.url;
      this.source   = message.source;
      this.dest     = message.dest;    
  }

  examplefunction() {
    this.serverless.cli.log('Hello from Serverless!');
  }
}

module.exports = Message;
