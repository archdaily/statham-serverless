'use strict';
var fs = require('fs');
var ejs = require('ejs');
var url = require('url');
var jwt = require('jsonwebtoken');

var credentials = require('nconf').file('credentials.json');
var secretToken = credentials.get('secretToken');

module.exports.split_mgs_by_dest = function(response) {
  var arrays = {
    uniques: [],
    repeated: {}
  }
  var lastmsg;
  var dest;
  var n = response.length;
  for (var i = 0; i < n; i++) {
    lastmsg = response.pop();
    dest = lastmsg.Message.destination;
    dest = dest.replace(/\/|\./g, "$");
    if (isDestIn(response, dest)) {
      if (!arrays.repeated[dest]) arrays.repeated[dest] = [];
      arrays.repeated[dest].push(lastmsg);
    } else {
      if (!arrays.repeated[dest]) arrays.uniques.push(lastmsg);
      else arrays.repeated[dest].push(lastmsg);
    }
  }
  return arrays;
}

var isDestIn = function(array, dest) {
  for (var i = 0; i < array.length; i++) {
    var array_dest = array[i].Message.destination;
    array_dest = array_dest.replace(/\/|\./g, "$");
    if (array_dest == dest) return true;
  }
  return false;
}

module.exports.create_token = function(origin) {
  var payload = {
    ip: origin
  };
  return jwt.sign(payload, secretToken);
};

module.exports.make_json_response = function(callback, statusCode, body) {
  var response = {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  callback(response);
}

module.exports.add_extras = function(event, messageJSON) {
  var urlDest = url.parse(messageJSON.url);
  messageJSON.destination = urlDest.pathname;
  if (!messageJSON.destination) messageJSON.destination = "undefined";
  messageJSON.origin = event.headers.Origin;
  if (!messageJSON.origin)
    messageJSON.origin = event.requestContext.identity.sourceIp;
  if (!messageJSON.origin) messageJSON.origin = 'undefined';
  messageJSON.resource =
    event.headers["X-Forwarded-Proto"] +
    "://" + event.headers["Host"] +
    "/" + event.requestContext["stage"] + event.path;
  messageJSON.id = event.requestContext.requestId;
  return messageJSON;
}

var make_html_response = function(statusCode, message, callback) {
  message_html(message, function(data) {
    var response = {
      statusCode: statusCode,
      headers: {
        "Content-Type": "text/html"
      },
      body: data
    };
    callback(response);
  });
}

module.exports.create_response =
  function(statusCode, isFromEmail, message, callback, response) {
    if (isFromEmail) {
      make_html_response(statusCode, message, callback);
    } else {
      if (response)
        make_json_response(
          callback, statusCode, { "Status": message, "Response": response });
      else
        make_json_response(callback, statusCode, { "Status": message });
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
    var data_message = ejs.render(data, {
      message: message
    });
    callback(data_message);
  });
}