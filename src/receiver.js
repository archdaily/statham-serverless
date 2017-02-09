'use strict';

var Message     = require('message');
var utilities   = require('utilities');
var cloudwatch  = require('cloudwatch');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  if(utilities.verifyTokenHeader(event)){
    var messageJSON = utilities.fetch_request_message(event, false);
    Message.send(messageJSON, function(sent){
      if(sent){
        create_response(
          messageJSON.email,
          "The message was delivered successfully.",
          function(response){
            callback(null, response);
          },
          event
        );
      }
      else{
        cloudwatch.enable_rule();
        create_response(
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
  else{
    var messageJSON = utilities.fetch_request_message(event, true);
    if(messageJSON){
      Message.send(messageJSON, function(sent){
        if(sent){
          create_response(
            messageJSON.email,
            "The message was delivered successfully.",
            function(response){
              callback(null, response);
            },
            event
          );
        }
        else{
          cloudwatch.enable_rule();
          create_response(
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
    else{
      callback(null, endpoint_response(
        "Invalid or missing token",
        event
      ));
    }
  }
}

var create_response = function(email, message, callback, event){
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
