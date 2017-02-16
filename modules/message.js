'use strict';

var https = require('https');
var http = require('http');
var url = require('url');
var utilities = require('modules/utilities');
var ses = require('modules/ses');
var sqs = require('modules/sqs');
var config = require('nconf').file('config.json');

var triesNum = parseInt(config.get('TriesNum'));

module.exports.send = function(message, callback) {
  validate_tries_message(message, function(response) {
    if (response.statusCode == 200)
      callback(true);
    else
      callback(false);
  });
}

var add_attributes = function(messageJSON) {
  var urlDest = url.parse(messageJSON.url);
  messageJSON.destination = urlDest.pathname;
  return messageJSON;
}


var validate_tries_message = function(messageJSON, callback) {
  if (!messageJSON.tries)
    messageJSON.tries = 0;
  messageJSON.tries += 1;

  if (messageJSON.tries > triesNum)
    error_message_to_email(messageJSON, function(response) {
      callback(response);
    });
  else
    send_message(messageJSON, function(response) {
      callback(response);
    });
}

var error_message_to_email = function(messageJSON, callback) {
  ses.mail_message_generator(messageJSON);
  utilities.make_json_response(callback, 200, {
    "response": "email sended"
  });
}

var get_string_body = function(messageJSON) {
  return JSON.stringify(messageJSON.body);
}

var serialize_options = function(messageJSON) {
  var postData = get_string_body(messageJSON);
  var urlDest = url.parse(messageJSON.url);
  messageJSON.destination = urlDest.pathname;
  var options = {
    hostname: urlDest.host,
    port: urlDest.port,
    path: urlDest.pathname,
    method: messageJSON.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };
  return options;
}

var make_https_request = function(options, data, callback) {
  var req = https.request(options, (res) => {
    var dataResponse = "";
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      dataResponse += chunk;
    });
    res.on('end', () => {
      utilities.make_json_response(callback, 200, {
        "success": JSON.parse(dataResponse)
      });
    });
  });
  req.on('error', (e) => {
    utilities.make_json_response(callback, 400, {
      "error": e.message
    });
  });
  req.write(data);
  req.end();
}

var make_http_request = function(options, data, callback) {
  var req = http.request(options, (res) => {
    var dataResponse = "";
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      dataResponse += chunk;
    });
    res.on('end', () => {
      var response = utilities.make_json_response(callback, 200, {
        "success": dataResponse
      });
    });
  });
  req.on('error', (e) => {
    var response = utilities.make_json_response(callback, 400, {
      "error": e.message
    });
  });
  req.write(data);
  req.end();
}

var send_message = function(messageJSON, callback) {
  var postData = get_string_body(messageJSON);
  var options = serialize_options(messageJSON);

  var protocol = url.parse(messageJSON.url).protocol;
  console.log("message sent:");
  console.log(postData);
  if (protocol == 'https:') {
    make_https_request(options, postData, function(response) {
      var body = JSON.parse(response.body);
      if (body.error) {
        messageJSON.error = body.error;
        sqs.send_msg_trunk(messageJSON);
        callback(response);
      } else
        callback(response);
    });
  }
  if (protocol == 'http:') {
    make_http_request(options, postData, function(response) {
      var body = JSON.parse(response.body);
      if (body.error) {
        messageJSON.error = body.error;
        sqs.send_msg_trunk(messageJSON);
        callback(response);
      } else
        callback(response);
    });
  }
}