'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');
var cloudwatch  = require('cloudwatch');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    console.log("SQS LIST!");
    var listMsg = sqs.get_list_trunk();
    var all_sent = true;
    for(message in listMsg){
      sqs.delete_msg_trunk(message.ReceiptHandle);

      var messageOBJ = new Message(message.Message);
      var was_sent = messageOBJ.send();

      if(!was_sent) all_sent = false;
    }
    if(all_sent) cloudwatch.disable_rule();
  }
  else{
    console.log("SINGLE MESSAGE!");
    var messageJSON = utilities.fetch_request_message(event);
    var messageOBJ = new Message(messageJSON);
    var was_sent = messageOBJ.send();
    var back = utilities.make_json_response(200,{
      "Response" : "Statham received your message!"
    });
    callback(null, back);
  }
};
