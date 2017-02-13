'use strict';

var Message     = require('message');
var utilities   = require('utilities');
var cloudwatch  = require('cloudwatch');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  if(utilities.verifyTokenHeader(event)){
    var messageJSON = utilities.fetch_request_message(event, false);
    deliver_message(messageJSON, function(response){
      callback(null, response);
    });
  }
  else{
    callback(null, endpoint_response(
      "Invalid Authorization Token"));
    }
  }
}

module.exports.emailResend = (event, context, callback) => {
  if(!event.queryStringParameters.token){
      callback(null, endpoint_response(
      "Missing Authorization Token"));
  }
  else{
    var messageJSON = utilities.fetch_request_message(event, true);
    if(messageJSON){
      deliver_message(messageJSON, function(response){
        callback(null, response);
      });
    }
    else{
      callback(null, endpoint_response(
        "Invalid Authorization Token"
      ));
    }
  }
}

var create_response = function(email, message, callback){
  if(email == 1){
    utilities.make_html_response(function(response){
      callback(response);
    },
    message);
  }
  else{
    callback(endpoint_response(message));
  }
}

var endpoint_response = function(message){
  var response = utilities.make_json_response(200,{
    "Response" : "Statham received your message!",
    "Status" : message
  });
  return response;
}

var deliver_message = function(messageJSON, callback){
  Message.send(messageJSON, function(sent){
    if(sent){
      create_response(
        messageJSON.email,
        "The message was delivered successfully.",
        function(response){
          callback(response);
        }
      );
    }
    else{
      cloudwatch.enable_rule();
      create_response(
        messageJSON.email,
        "The message could not be delivered but is in the queue of attempts.",
        function(response){
          callback(response);
        }
      );
    }
  });
}
