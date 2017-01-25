'use strict';
var Message = require('message');

module.exports.send = (event, context, callback) => {
  if(event.source == 'aws.events'){
    //get list from SQS
  }
  else{
    console.log("SINGLE MESSAGE!");
    var messageJSON = fetch_request_message(event);
    var messageOBJ = new Message(messageJSON);
    var was_sent = messageOBJ.send();
    if(was_sent){
    }
    var back = make_json_response(200,{
      "Response" : "Statham received your message!"
    });
    callback(null, back);
  }

};

var make_json_response = function(statusCode,body){
  var response = {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
  return response;
}

var fetch_request_message = function(event){
  var messageJSON;
  if(event.source == 'aws.events'){
    messageJSON = JSON.parse(event.Records[0].Sns.Message);
  }
  else{
    messageJSON = JSON.parse(event.body);
    messageJSON.source = event.headers.Origin;
  }
  return messageJSON;
}
