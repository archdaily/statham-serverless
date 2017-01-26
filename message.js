'use strict';

var https             = require('https');
var url               = require('url');
var utilities         = require('utilities');
var cloudwatch        = require('cloudwatch');
var sns               = require('sns');
var ses               = require('ses');

class Message {

  constructor(message) {
      this.message  = message;
      this.method   = message.method;
      this.body     = message.body;
      this.url      = message.url;
      this.source   = message.source;
      this.dest     = message.dest;
  }

  send() {
    validate_tries_message(this.message, function(response){
      if(response.statusCode == 200)
        return(true);
      else
        return(false);
    });
  }
}

// Code Message

var validate_tries_message = function(messageJSON, callback){
  if(!messageJSON.tries)
    messageJSON.tries = 0;
  messageJSON.tries += 1;

  if(messageJSON.tries > 5)
    error_message_to_email(messageJSON, function(response){
      callback(response);
    });
  else
    send_message(messageJSON, function(response){
      callback(response);
    });
}

var mail_message_generator = function(messageJSON){
  var message = `
Statham tried to transporting five times the message but the destination couldn't be reached.
Details:

    Method: ${messageJSON.method}
    URL destination: ${messageJSON.url}
    Source: ${messageJSON.source}
    Destination path: ${messageJSON.dest}

Body:
${JSON.stringify(messageJSON.body, null, 2)}

Error: ${messageJSON.error}
`;
  return message;
}

var error_message_to_email = function(messageJSON, callback){
  ses.mail_message_generator();
  var response = utilities.make_json_response(400,{
    "response" : "email sended"
  });
}

var get_string_body = function(messageJSON){
  return JSON.stringify(messageJSON.body);
}

// Code SNS

var serialize_options = function(messageJSON){
  var postData = get_string_body(messageJSON);
  var urlDest = url.parse(messageJSON.url);
  messageJSON.dest = urlDest.pathname;
  var options = {
    hostname: urlDest.host,
    port: urlDest.port,
    path: urlDest.pathname,
    method: messageJSON.method,
    headers: {
      'Content-Type' : 'application/json',
      'Content-Length': postData.length
    }
  };
  return options;
}

var make_http_request = function(options, data, callback){
  var req = https.request(options, (res) => {
    var dataResponse = "";
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      dataResponse += chunk;
    });
    res.on('end', () => {
      var response = utilities.make_json_response(200,{
        "success" : JSON.parse(dataResponse)
      });
      callback(response);
    });
  });
  req.on('error', (e) => {
    var response = utilities.make_json_response(400,{
      "error" : e.message
    })
    callback(response);
  });
  req.write(data);
  req.end();
}

// SEND MESSAGE

var send_message = function(messageJSON, callback){
  var postData = get_string_body(messageJSON);
  var options = serialize_options(messageJSON);
  make_http_request(options,postData,function(response){
    var body = JSON.parse(response.body);
    if(body.error){
      messageJSON.error = body.error;
      var responseSNS = sns.publish_message_sns(
          JSON.stringify(messageJSON),
          "Message not delivered From Lambda",
          'arn:aws:sns:us-west-2:451967854914:Statham-notification');
      body.SNS = responseSNS;
      response.body = JSON.stringify(body);
      cloudwatch.enable_rule();
    }
    else
      callback(response);
  });
}

module.exports = Message;
