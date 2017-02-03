
'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');
var async       = require('async');
var cloudwatch  = require('cloudwatch');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    resend_from_trunk();
  }
  else if(event.headers.Origin == 'https://mail.google.com'){
    callback(null, endpoint_response(
      event
    ));
  }
  else{
    var messageJSON = utilities.fetch_request_message(event);
    send_message(messageJSON, function(sent){
      if(sent){
        callback(null, endpoint_response("Message sent"));
      }
      else{
        cloudwatch.enable_rule();
        callback(null, endpoint_response(
          "The message couldn't be sent, added to the pending list"
        ));
      }
    });
  }
};

var endpoint_response = function(status){
  var response = utilities.make_json_response(200,{
    "Response" : "Statham received your message!",
    "Status" : status
  });
  return response;
}

var resend_from_trunk = function(){
  sqs.get_list_trunk(function(listMsg){
    process_list_concurrently(listMsg);
  });
}

var process_list_concurrently = function(listMsg){
  async.every(listMsg.Messages, function(message, next){
    process_message(message, function(sent){
      next(null, sent);
    });
  }, function(sent, result) {
    if(result) cloudwatch.disable_rule();
    else cloudwatch.enable_rule();
  });
}

var process_message = function(message, callback){
  send_message(message.Message, function(sent){
    callback(sent);
  });
}

var send_message = function(message, callback){
  Message.send(message,function(response){
    callback(response);
  });
}
