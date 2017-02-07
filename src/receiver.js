'use strict';

var Message     = require('message');
var utilities   = require('utilities');
var cloudwatch  = require('cloudwatch');

module.exports.receiveAndSendMessage = (event, context, callback) => {

  var messageJSON = utilities.fetch_request_message(event);

  Message.send(messageJSON, function(sent){
    if (messageJSON.email){
      if(sent){
        utilities.make_html_response(function(response){
          callback(null,response);
        }, "The message was delivered successfully."
        );
      }
      else{
        cloudwatch.enable_rule();
        utilities.make_html_response(function(response){
          callback(null,response);
        }, "The message could not be delivered but is in the queue of attempts."
        );
      }
    }
    else{
      if(sent){
        callback(null, endpoint_response("Message sent."));
      }
      else{
        cloudwatch.enable_rule();
        callback(null, endpoint_response(
          "The message could not be delivered but is in the queue of attempts."
        ));
      }
    }
  });
}

var endpoint_response = function(status){
  var response = utilities.make_json_response(200,{
    "Response" : "Statham received your message!",
    "Status" : status
  });
  return response;
}
