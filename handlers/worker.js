'use strict';
var Message = require('../modules/message');
var sqs = require('../modules/sqs');
var utilities = require('../modules/utilities');
var async = require('async');
var cloudwatch = require('../modules/cloudwatch');

var all_sent;

module.exports.workFromTrunk = (event, context, callback) => {
  get_messages_from_trunk(function(data) {
    resend_data(data, callback);
  });
}

var resend_data = function(data, callback_resend) {
  all_sent = true;
  async.parallel([
      function(callback) {
        async.each(data.uniques, function(message, next) {
          send_and_next(message.Message, next);
        }, function(err) {
          callback();
        });
      },
      function(callback) {
        async.each(Object.keys(data.repeated), function(key, next_repeated) {
          async.eachSeries(data.repeated[key], function(message, next) {
            send_and_next(message.Message, next);
          }, function(err) {
            next_repeated();
          });
        }, function(err) {
          callback()
        });
      }
    ],
    function(err, results) {
      if (all_sent) {
        cloudwatch.disable_rule();
      }
      utilities.create_response(
        200,
        false,
        "OK",
        function(response) { callback_resend(null, response); },
        null
      );
    }
  );
}

var send_and_next = function(message, next) {
  Message.send(message, function(err_send, response) {
    if (err_send) all_sent = false;
    next();
  });
}

var get_messages_from_trunk = function(callback) {
  sqs.create_get_queue_url("Statham" + process.env.MODE + "Trunk", function(TrunkUrl) {
    sqs.get_list(TrunkUrl, function(response) {
      callback(utilities.split_mgs_by_dest(response));
    });
  });
}