'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');
var async       = require('async');
var cloudwatch  = require('cloudwatch');
var sleep       = require('sleep');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    console.log("getting list trunk...");
    sqs.get_list_trunk(function(listMsg){
      console.log("list trunk:");
      console.log(listMsg);
      async.each(listMsg.Messages, function (message, next){
        var messageOBJ = new Message(JSON.parse(message.Message));
        messageOBJ.send();
        sqs.delete_msg_trunk(message.ReceiptHandle, function(){
          next();
        });
      }, function() {
        sleep(300);
        sqs.get_count_trunk(function(count){
          console.log("count trunk:");
          console.log(count);
          if(count == 0){
            cloudwatch.disable_rule();
            console.log("rule disabled!");
          }
        });
      });
    });
  }
  else{
    console.log("sending message arrived from HTTP");
    var messageJSON = utilities.fetch_request_message(event);
    var messageOBJ = new Message(messageJSON);
    var was_sent = messageOBJ.send();
    var back = utilities.make_json_response(200,{
      "Response" : "Statham received your message!"
    });
    callback(null, back);
  }
};
