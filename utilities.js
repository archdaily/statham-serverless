'use strict';

module.exports.make_json_response = function(statusCode,body){
  var response = {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
  return response;
}

module.exports.fetch_request_message = function(event){
  var messageJSON;
  if(event.source == 'aws.events'){
    messageJSON = JSON.parse(event.Records[0].Sns.Message);
  }
  else{
    messageJSON = JSON.parse(event.body);
    messageJSON.source = event.headers.Origin;
    messageJSON.id = event.requestContext.requestId;
  }
  return messageJSON;
}

module.exports.get_random_char = function(){
  var charSet = char_set();
  var char = charSet.charAt(get_random_number(0, charSet.length));
  return char;
}

var get_random_number = function(lowerBound,upperBound){
  var random = Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
  return random;
}

var char_set = function(){
  var charSet = "";
  charSet += number_chars();
  charSet += lower_chars();
  charSet += upper_chars();
  return charSet;
}

var lower_chars = function(){
  return "abcdefghijklmnopqrstuvwxyz";
}

var upper_chars = function(){
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

var number_chars = function(){
  return "0123456789";
}
