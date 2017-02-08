'use strict';

var Message     = require('message');
var utilities   = require('utilities');
var cloudwatch  = require('cloudwatch');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  var messageJSON = utilities.fetch_request_message(event);
  Message.send(messageJSON, function(sent){
    if(sent){
      send_response(
        messageJSON.email,
        "The message was delivered successfully.",
        function(response){
          callback(null, response);
        },
        event
      );
    }
    else{
      send_response(
        messageJSON.email,
        "The message could not be delivered but is in the queue of attempts.",
        function(response){
          callback(null, response);
        },
        event
      );
    }
  });
}

var send_response = function(email, message, callback, event){
  if(email == 1){
    utilities.make_html_response(function(response){
      callback(response);
    },
    message);
  }
  else{
    callback(endpoint_response(message, event));
  }
}

var endpoint_response = function(message, event){
  var response = utilities.make_json_response(200,{
    "Response" : "Statham received your message!",
    "Status" : message,
    "Event" : event
  });
  return response;
}
