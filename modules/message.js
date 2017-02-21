'use strict';

var https = require('https');
var http = require('http');
var url = require('url');
var utilities = require('./utilities');
var validator = require('./validator');
var ses = require('./ses');
var sqs = require('./sqs');
var config = require('nconf').file('config.json');

var triesNum = parseInt(config.get('TriesNum'));

module.exports.send = function(message, callback) {
  validate_tries_message(message, function(response) {
    if (response.error) message.error = response.error;
    determinate_action_response(message, response, callback);
  });
}

var determinate_action_response = function(message, response, callback) {
  switch (response.statusCode) {
    case 200:
    case 201:
    case 202:
    case 203:
    case 204:
    case 205:
    case 206:
    case 207:
    case 208:
      callback(null, resp(
        "The message was delivered successfully.",
        response));
      break;
    case 401:
      error_message_to_email(message, function(msg) {
        callback(null, resp(
          "The message couldn't be sent, details on email",
          response));
      });
      break;
    case 400:
    default:
      error_message_to_trunk(message);
      callback(
        resp(
          "The message couldn't be sent, therefore it was added to the queue",
          response));
      break;
  }
}

var resp = function(message, response) {
  var res = {
    message: message,
    response: response
  }
  return res;
}

var error_message_to_trunk = function(message) {
  sqs.send_msg_trunk(message);
}

var validate_tries_message = function(message, callback) {
  if (!message.tries)
    message.tries = 0;
  message.tries += 1;

  if (message.tries > triesNum)
    error_message_to_email(message, function(response) {
      callback(response);
    });
  else
    send_message(message, function(response) {
      callback(response);
    });
}

var error_message_to_email = function(message, callback) {
  ses.mail_message_generator(message);
  utilities.make_json_response(callback, 200, {
    "response": "email sended"
  });
}

var send_message = function(message, callback) {
  var postData = get_string_body(message);
  var options = serialize_options(message, postData.length);
  var protocol = url.parse(message.url).protocol;
  if (protocol == 'https:') {
    make_https_request(options, postData, function(response) {
      callback(response);
    });
  } else if (protocol == 'http:') {
    make_http_request(options, postData, function(response) {
      callback(response);
    });
  }
}

var get_string_body = function(message) {
  return JSON.stringify(message.body);
}

var serialize_options = function(message, data_length) {
  var urlDest = url.parse(message.url);
  var options = {
    hostname: urlDest.host,
    port: urlDest.port,
    path: urlDest.pathname,
    method: message.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data_length
    }
  };
  return options;
}

var make_https_request = function(options, data, callback) {
  var req = https.request(options, (res) => {
    working_data(res, callback);
  });
  req_error(req, callback);
  write_data(req, data);
}

var make_http_request = function(options, data, callback) {
  var req = http.request(options, (res) => {
    working_data(res, callback);
  });
  req_error(req, callback);
  write_data(req, data);
}

var working_data = function(res, callback) {
  var dataResponse = "";
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    dataResponse += chunk;
  });
  res.on('end', () => {
    callback({ success: JSON.parse(dataResponse), statusCode: res.statusCode });
  });
}

var req_error = function(req, callback) {
  req.on('error', (e) => {
    callback({ error: e.message, statusCode: 400 });
  });
}

var write_data = function(req, data) {
  req.write(data);
  req.end();
}