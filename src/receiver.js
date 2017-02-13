'use strict';

var Message     = require('message');
var utilities   = require('utilities');
var cloudwatch  = require('cloudwatch');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  if(utilities.verifyTokenHeader(event)){
    var messageJSON = utilities.fetch_request_message(event, false);
    deliver_message(false, messageJSON, callback);
  }
  else{
    create_response(false, "Invalid or missing auth token", function(response){
      callback(null, response);
    });
  }
}

module.exports.emailResend = (event, context, callback) => {
  if(utilities.verifyTokenStringParameter(event)){
    var messageJSON = utilities.fetch_request_message(event, true);
    deliver_message(true, messageJSON, callback);
  }
  else{
    create_response(true, "No transport service required", function(response){
      callback(null, response);
    });
  }
}

var create_response = function(email, message, callback){
  if(email){
    utilities.make_html_response(message, callback);
  }
  else{
    utilities.make_json_response(callback, 200, { "Status" : message });
  }
}

var deliver_message = function(email, messageJSON, callback){
  Message.send(messageJSON, function(sent){
    if(sent){
      create_response(
        email,
        "The message was delivered successfully.",
        function(response){
          callback(null, response);
        }
      );
    }
    else{
      cloudwatch.enable_rule();
      create_response(
        email,
        "The message could not be delivered but is in the queue of attempts.",
        function(response){
          callback(null, response);
        }
      );
    }
  });
}
