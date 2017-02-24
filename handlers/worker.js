'use strict';
var Message = require('../modules/message');
var sqs = require('../modules/sqs');
var utilities = require('../modules/utilities');
var async = require('async');
var cloudwatch = require('modules/cloudwatch');

module.exports.workFromTrunk = (event, context, callback) => {
  sqs.get_count_trunk(function(number) {
    consume_sqs(number, callback);
  });
}

var consume_sqs = function(number, callback) {
  var N = utilities.get_number_of_threads(number);
  var arr = utilities.get_array_of_numbers(N);
  async.every(arr, function(i, next_request) {
    async.forever(
      function(call_forever) {
        sqs.get_messages_trunk(function(err_get, messages) {
          if (err_get) call_forever();
          else {
            call_forever(messages);
          }
        });
      },
      function(messages) {
        async.every(messages, function(message, next) {
          Message.send(message.Message, function(err_send, response) {
            if (err_send) {
              next(null, false);
            } else {
              next(null, true);
            }
          });
        }, function(sent, result) {
          if (result) {
            next_request(null, true);
          } else {
            next_request(null, false);
          }
        });
      }
    );
  }, function(sent, result) {
    if (result) {
      cloudwatch.disable_rule();
    }
    utilities.create_response(
      200,
      false,
      "OK",
      function(response) { callback(null, response); },
      null
    )
  });
}