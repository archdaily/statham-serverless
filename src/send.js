'use strict';
var Message   = require('message');
var utilities = require('utilities');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    //get list from SQS
  }
  else{
    console.log("SINGLE MESSAGE!");
    var messageJSON = utilities.fetch_request_message(event);
    var messageOBJ = new Message(messageJSON);
    var was_sent = messageOBJ.send();
    if(was_sent){
    }
    var back = utilities.make_json_response(200,{
      "Response" : "Statham received your message!"
    });
    callback(null, back);
  }

};