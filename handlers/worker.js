'use strict';
var Message = require('../modules/message');
var sqs = require('../modules/sqs');
var async = require('async');
var cloudwatch = require('modules/cloudwatch');

module.exports.workFromTrunk = (event, context, callback) => {
  sqs.get_list_trunk(function(listMsg) {
    console.log(listMsg.Messages.length);
    process_list_concurrently(listMsg);
  });
}

var process_list_concurrently = function(listMsg) {
  async.every(listMsg.Messages, function(message, next) {
    Message.send(message.Message, function(err, response) {
      console.log("message processed!");
      if (err) {
        next(null, false);
        console.log("send fail!");
      } else {
        next(null, true);
        console.log("send success!");
      }
    });
  }, function(sent, result) {
    console.log(result);
    if (result) {
      cloudwatch.disable_rule();
      console.log("rule disabled");
    }
  });
}