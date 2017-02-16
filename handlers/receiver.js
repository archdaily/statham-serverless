'use strict';

var Message = require('modules/message');
var utilities = require('modules/utilities');
var cloudwatch = require('modules/cloudwatch');
var validator = require('modules/validator');

module.exports.receiveAndSendMessage = (event, context, callback) => {
  console.log(event);
  console.log(context);
  validate_and_send(false, event, callback);
}

module.exports.emailResend = (event, context, callback) => {
  validate_and_send(true, event, callback);
}

var validate_and_send = function(isFromEmail, event, callback) {
  var messageJSON = validator.validateParams(isFromEmail, event);
  if (messageJSON) {
    messageJSON = utilities.add_extras(event, messageJSON);
    deliver_message(isFromEmail, messageJSON, callback);
  } else {
    utilities.create_response(isFromEmail,
      "There is an error with the request. Please verify.",
      function(response) {
        callback(null, response);
      }
    );
  }
}

var deliver_message = function(isHTML, messageJSON, callback) {
  Message.send(messageJSON, function(sent) {
    if (sent) {
      utilities.create_response(isHTML, "The message was delivered successfully.",
        function(response) {
          callback(null, response);
        }
      );
    } else {
      cloudwatch.enable_rule();
      utilities.create_response(isHTML,
        "The message couldn't be sent, therefore it was added to the queue",
        function(response) {
          callback(null, response);
        }
      );
    }
  });
}