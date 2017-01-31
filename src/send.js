
'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');
var async       = require('async');
var cloudwatch  = require('cloudwatch');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    sqs.get_list_trunk(function(listMsg){
      async.every(listMsg.Messages, function(message, next){
        sqs.delete_msg_trunk(message.ReceiptHandle);
        send_message(JSON.parse(message.Message), function(sent){
          next(null, sent);
        });
      }, function(sent, result) {
        if(result) check_sqs();
      });
    });
  }
  else{
    var messageJSON = utilities.fetch_request_message(event);
    send_message(messageJSON, function(sent){
      if(sent){
        var response = utilities.make_json_response(200,{
          "Response" : "Statham received your message!"
          "Status" : "Message sent"
        });
        callback(null, response);
      }
      else{
        var response = utilities.make_json_response(200,{
          "Response" : "Statham received your message!"
          "Status" : "The message couldn't be sent, added to the pending list"
        });
        callback(null, response);
      }
    });
  }
};

var send_message = function(message, callback){
  Message.send(message,function(response){
    callback(response);
  });
}

var check_sqs = function(){
  cloudwatch.disable_rule();
}
