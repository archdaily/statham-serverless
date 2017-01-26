'use strict';
var Message     = require('message');
var utilities   = require('utilities');
var sqs         = require('sqs');

module.exports.send = (event, context, callback) => {
  console.log(event);
  if(event.source == 'aws.events'){
    sqs.get_count_trunk(function(number){

    });
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
