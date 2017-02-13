'use strict';
var fs                = require('fs');
var ejs               = require('ejs');
var jwt               = require('jsonwebtoken');
var moment            = require('moment');

var credentials       = require('nconf').file('credentials.json');
var secretToken       = credentials.get('secretToken');

module.exports.createToken = function(origin) {
  var payload = {
    ip: origin,
    iat: moment().unix(),
    exp: moment().add(14, "days").unix(),
  };
  return jwt.sign(payload, secretToken);
};

module.exports.verifyTokenHeader = function(event){
  if(!event.headers.Authorization) {
    return false;
  }
  var tokenJWT = event.headers.Authorization;

  return verifyToken(tokenJWT);
}

module.exports.verifyTokenStringParameter = function(event){
  if(!event.queryStringParameters) return false;
  else if(!event.queryStringParameters.token) return false;

  var tokenJWT = event.queryStringParameters.token;

  return verifyToken(tokenJWT);
}

module.exports.make_json_response = function(callback, statusCode, body){
  var response = {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
  callback(response);
}

module.exports.fetch_request_message = function(event, email){
  var messageJSON;
  if(email){
    messageJSON = get_message_from_email(event);
  }
  else{
    messageJSON = JSON.parse(event.body);
  }
  messageJSON.source = event.headers.Origin;
  messageJSON.resource = event.headers["X-Forwarded-Proto"] + "://" + event.headers["Host"] + "/" + event.requestContext["stage"] + event.path;
  messageJSON.id = event.requestContext.requestId;
  return messageJSON;
}

module.exports.make_html_response = function(message, callback){
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

var message_html = function(message, callback){
  fs.readFile('views/resend.html', 'utf8', function (err,data) {
    if (err) {
      console.log(err);
    }
    var data_message = ejs.render(data, {
        message      : message
    });
    callback(data_message);
  });
}

var get_message_from_email = function(event){
  var messageJSON = {
    "method"   : "POST",
    "url"      : event.queryStringParameters.url,
    "token"    : event.queryStringParameters.token,
    "body"     : event.queryStringParameters.body
  }
  return messageJSON;
}

var verifyToken = function(token){
  try {
    var decoded = jwt.verify(token, secretToken);
    return true;
  } catch(err) {
    return false;
  }
}
