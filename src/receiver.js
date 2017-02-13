'use strict';

var Message     = require('message');
var utilities   = require('utilities');
var cloudwatch  = require('cloudwatch');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  if(utilities.verifyTokenHeader(event)){
    var messageJSON = utilities.fetch_request_message(event, false);
    deliver_message(messageJSON, callback);
  }
  else{
    callback(null, endpoint_response(
      "Invalid Authorization Token"
    ));
  }
}

module.exports.emailResend = (event, context, callback) => {
  if(!event.queryStringParameters){
    utilities.make_html_response(
      "No transport service required",
      function(response){
        callback(null, response);
      }
    );
  }
  else{
    var messageJSON = utilities.fetch_request_message(event, true);
    if(messageJSON){
      deliver_message(messageJSON, callback);
    }
    else{
      utilities.make_html_response("Invalid Authorization Token", callback);
    }
  }
}

var create_response = function(email, message, callback){
  if(email == 1){
    utilities.make_html_response(message, callback);
  }
  else{
    callback(
      utilities.make_json_response(200,
        {
          "Status" : message
        }
      )
    );
  }
}

var deliver_message = function(messageJSON, callback){
  Message.send(messageJSON, function(sent){
    if(sent){
      create_response(
        messageJSON.email,
        "The message was delivered successfully.",
        function(response){
          callback(null, response);
        }
      );
    }
    else{
      cloudwatch.enable_rule();
      create_response(
        messageJSON.email,
        "The message could not be delivered but is in the queue of attempts.",
        function(response){
          callback(null, response);
        }
      );
    }
  });
}
