'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');
var async       = require('async');
var cloudwatch  = require('cloudwatch');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    sqs.get_list_trunk(function(listMsg){
      var all_sent = true;
      async.each(listMsg.Messages, function (message, callback){
        sqs.delete_msg_trunk(message.ReceiptHandle);
        var messageOBJ = new Message(JSON.parse(message.Message));
        messageOBJ.send();
      }, function() {
        sqs.get_count_trunk(function(count){
          if(count == 0){
            cloudwatch.disable_rule();
          }
        });
      });
    });
  }
  else{
    var messageJSON = utilities.fetch_request_message(event);
    var messageOBJ = new Message(messageJSON);
    var was_sent = messageOBJ.send();
    var back = utilities.make_json_response(200,{
      "Response" : "Statham received your message!"
    });
    callback(null, back);
  }
};
