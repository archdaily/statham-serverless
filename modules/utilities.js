'use strict';
var fs = require('fs');
var ejs = require('ejs');
var url = require('url');
var jwt = require('jsonwebtoken');
var moment = require('moment');

var credentials = require('nconf').file('credentials.json');
var secretToken = credentials.get('secretToken');

module.exports.createToken = function(origin) {
  var payload = {
    ip: origin,
    iat: moment().unix(),
    exp: moment().add(14, "days").unix(),
  };
  return jwt.sign(payload, secretToken);
};

module.exports.make_json_response = function(callback, statusCode, body) {
  var response = {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
  callback(response);
}

module.exports.add_extras = function(event, messageJSON) {
  var urlDest = url.parse(messageJSON.url);
  messageJSON.destination = urlDest.pathname;
  messageJSON.source = event.headers.Origin;
  if (!messageJSON.source) messageJSON.source = event.requestContext.identity.userAgent;
  if (!messageJSON.source) messageJSON.source = event.requestContext.identity.sourceIp;
  if (!messageJSON.source) messageJSON.source = 'anonimous';
  messageJSON.resource =
    event.headers["X-Forwarded-Proto"] +
    "://" + event.headers["Host"] +
    "/" + event.requestContext["stage"] + event.path;
  messageJSON.id = event.requestContext.requestId;
  return messageJSON;
}

var make_html_response = function(message, callback) {
  message_html(message, function(data) {
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

module.exports.create_response = function(email, message, callback) {
  if (email) {
    make_html_response(message, callback);
  } else {
    make_json_response(callback, 200, { "Status": message });
  }
}

var make_json_response = function(callback, statusCode, body) {
  var response = {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
  callback(response);
}

module.exports.get_random_char = function() {
  var charSet = char_set();
  var char = charSet.charAt(get_random_number(0, charSet.length));
  return char;
}

var get_random_number = function(lowerBound, upperBound) {
  var random =
    Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
  return random;
}

var char_set = function() {
  var charSet = "";
  charSet += number_chars();
  charSet += lower_chars();
  charSet += upper_chars();
  return charSet;
}

var lower_chars = function() {
  return "abcdefghijklmnopqrstuvwxyz";
}

var upper_chars = function() {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

var number_chars = function() {
  return "0123456789";
}

var message_html = function(message, callback) {
  fs.readFile('views/resend.html', 'utf8', function(err, data) {
    if (err) {
      console.log(err);
    }
    var data_message = ejs.render(data, {
      message: message
    });
    callback(data_message);
  });
}