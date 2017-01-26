'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    console.log("SQS LIST!");
    var listMsg = sqs.get_list_trunk();
    for(message in listMsg){
      console.log(message);
    }
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
