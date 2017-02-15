'use strict';

var Message = require('message');
var utilities = require('utilities');
var cloudwatch = require('cloudwatch');
var validator = require('validator');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  validate_and_send(false, event, callback);
}

module.exports.emailResend = (event, context, callback) => {
  validate_and_send(true, event, callback);
}

var validate_and_send = function(email, event, callback) {
  var messageJSON = validator.validateParams(email, event);
  if (messageJSON) {
    messageJSON = utilities.add_extras(event, messageJSON);
    deliver_message(email, messageJSON, callback);
  } else {
    utilities.create_response(email, "There is an error with the request. Please verify.",
      function(response) {
        callback(null, response);
      }
    );
  }
}

var deliver_message = function(email, messageJSON, callback) {
  Message.send(messageJSON, function(sent) {
    if (sent) {
      create_response(email, "The message was delivered successfully.",
        function(response) {
          callback(null, response);
        }
      );
    } else {
      cloudwatch.enable_rule();
      utilities.create_response(email,
        "The message couldn't be sent, therefore it was added to the queue",
        function(response) {
          callback(null, response);
        }
      );
    }
  });
}