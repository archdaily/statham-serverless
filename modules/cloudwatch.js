'use strict';

var AWS = require('aws-sdk');
var config = require('nconf').file('config.json');

AWS.config.loadFromPath('./credentials.json');

var cloudwatchevents = new AWS.CloudWatchEvents();
var lambda = new AWS.Lambda();
var scheduleExpression = config.get('CycleExpression');
var StathamRuleName = "StathamCycle";

module.exports.enable_rule = function() {
  var params = {
    Name: StathamRuleName,
    ScheduleExpression: scheduleExpression,
    State: 'ENABLED'
  };
  cloudwatchevents.putRule(params, function(err, data) {});
}

module.exports.disable_rule = function() {
  var params = {
    Name: StathamRuleName,
    ScheduleExpression: scheduleExpression,
    State: 'DISABLED'
  };
  cloudwatchevents.putRule(params, function(err, data) {});
}

var exist_rule = function(callback) {
  var params = {
    Limit: 1,
    NamePrefix: StathamRuleName
  };
  cloudwatchevents.listRules(params, function(err, data) {
    if (err) {
      callback(false);
    } else {
      if (data.Rules.length == 1) callback(true);
      else callback(false);
    }
  });
}