'use strict';

var Message = require('../modules/message');
var utilities = require('../modules/utilities');
var cloudwatch = require('../modules/cloudwatch');
var validator = require('../modules/validator');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  validate_and_send(false, event, callback);
}

module.exports.emailResend = (event, context, callback) => {
  validate_and_send(true, event, callback);
}

var validate_and_send = function(isFromEmail, event, callback) {
  validator.getParams(isFromEmail, event, function(err, message) {
    if (err) {
      utilities.create_response(
        err.code,
        isFromEmail,
        "There is an error with the request: " + err.message,
        function(response) {
          callback(null, response);
        }
      );
    } else {
      message = utilities.add_extras(event, message);
      deliver_message(isFromEmail, message, callback);
    }
  });
}

var deliver_message = function(isHTML, messageJSON, callback) {
  Message.send(messageJSON, function(err, res) {
    if (err) {
      cloudwatch.enable_rule();
      utilities.create_response(
        202,
        isHTML,
        "The message couldn't be sent, therefore it was added to the queue",
        function(response) {
          callback(null, response);
        }
      );
    } else {
      utilities.create_response(200,
        isHTML,
        "The message was delivered successfully.",
        function(response) {
          callback(null, response);
        }
      );
    }
  });
}