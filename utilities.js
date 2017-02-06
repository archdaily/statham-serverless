'use strict';
var fs                = require('fs');
var ejs               = require('ejs');

var origin_mail = "https://mail.google.com";

module.exports.make_json_response = function(statusCode,body){
  var response = {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
  return response;
}

module.exports.fetch_request_message = function(event){
  var messageJSON;
  if(event.headers.Origin == origin_mail){
    var decoded_message = url_decode(event.body);
    var decoded_json = url_to_json(decoded_message);
    messageJSON = {
      "email"    : 1,
      "method"   : event.httpMethod,
      "url"      : get_url(decoded_json),
      "body"     : get_body(decoded_json)
    }
  }
  else{
    messageJSON = JSON.parse(event.body);
  }
  messageJSON.source = event.headers.Origin;
  messageJSON.id = event.requestContext.requestId;
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

var url_decode = function(code){
  var decoded_body = decodeURIComponent(code);
  return decoded_body;
}

var url_to_json = function(code){
  var hash;
  var myJson = {};
  var hashes = code.slice(code.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      myJson[hash[0]] = hash[1];
  }
  return myJson;
}

var get_url = function(decoded_json){
  return decoded_json.url;
}

var get_body = function(decoded_json){
  return decoded_json.body;
}

module.exports.make_html_response = function(callback , message){
  message_html(message, function(data){
      var response = {
        statusCode: 200,
        headers: { 
          "Content-Type": "text/html"  
        },
        body: data
      };
      callback(response);
  });
}

var message_html = function(message, callback){
  fs.readFile('resend.html', 'utf8', function (err,data) {
    if (err) {
      console.log(err);
    }
    var data_message = ejs.render(data, {
        message      : message
    });
    callback(data_message);
  });
}

