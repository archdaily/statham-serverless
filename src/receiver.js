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
        "The message was delivered successfully."
      );
    }
    else{
      send_response(
        messageJSON.email,
        "The message could not be delivered but is in the queue of attempts."
      );
    }

  });
}

var send_response = function(email, message){
  if(email == 1){
    utilities.make_html_response(function(response){
      callback(null,response);
    },
    message);
  }
  else{
    callback(null, endpoint_response(message));
  }
}

var endpoint_response = function(message){
  var response = utilities.make_json_response(200,{
    "Response" : "Statham received your message!",
    "Status" : message
  });
  return response;
}
