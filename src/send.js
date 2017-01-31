
'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');
var async       = require('async');
var cloudwatch  = require('cloudwatch');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    console.log("getting list trunk...");

    sqs.get_list_trunk(function(listMsg){
      console.log("list trunk:");
      console.log(listMsg);

      async.each(listMsg.Messages, function(message, next){
        console.log("message");
        console.log(message);
        send_message(JSON.parse(message.Message), function(sent){
          sqs.delete_msg_trunk(message.ReceiptHandle);
          console.log("message sended OUT");
          next();
        });
      }, function(sent) {
        console.log("finish!");
        check_sqs();
      });
    });
  }
  else{
    console.log("sending message arrived from HTTP");
    var messageJSON = utilities.fetch_request_message(event);
    var messageOBJ = new Message(messageJSON);
    messageOBJ.send();
    var back = utilities.make_json_response(200,{
      "Response" : "Statham received your message!"
    });
    callback(null, back);
  }
};

var send_message = function(message){
  var messageOBJ = new Message(message);
  messageOBJ.send(function(response){
    console.log(response);
    callback(response);
  });
}

var check_sqs = function(){
  sqs.get_count_trunk(function(count){
    console.log("count trunk:");
    console.log(count);
    if(count == 0){
      cloudwatch.disable_rule();
      console.log("rule disabled!");
    }
  });
}
