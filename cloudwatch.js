'use strict';

var AWS                 = require('aws-sdk');
var config              = require('nconf').file('config.json');

AWS.config.loadFromPath('./credentials.json');

var cloudwatchevents    = new AWS.CloudWatchEvents();
var lambda              = new AWS.Lambda();
var scheduleExpression  = config.get('CycleExpression');
var StathamRuleName     = "StathamCycle";

module.exports.enable_rule = function(){
  exist_rule(function(exist){
    var params = {
      Name: StathamRuleName,
      ScheduleExpression: scheduleExpression,
      State: 'ENABLED'
    };
    cloudwatchevents.putRule(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else{
        if(!exist){
          put_lambda_target();
          add_permission_trigger_lambda(data.RuleArn);
        }
      }
    });
  });
}

module.exports.disable_rule = function(){
  var params = {
    Name: StathamRuleName,
    ScheduleExpression: scheduleExpression,
    State: 'DISABLED'
  };
  cloudwatchevents.putRule(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
}

var put_lambda_target = function(){
  get_lambda(function(LambdaArn){
    var params = {
      Rule: StathamRuleName,
      Targets: [
        {
          Arn: LambdaArn,
          Id: "Lambda-Worker"
        }
      ]
    };
    cloudwatchevents.putTargets(params, function(err, data) {
      if (err) console.log(err, err.stack);
    });
  });
}

var add_permission_trigger_lambda = function(ruleArn){
  get_lambda(function(LambdaArn){
    var params = {
      Action: "lambda:InvokeFunction",
      FunctionName: LambdaArn,
      Principal: "events.amazonaws.com",
      SourceArn: ruleArn,
      StatementId: "ID-1"
    };
    lambda.addPermission(params, function(err, data) {
      if (err) console.log(err, err.stack);
    });
  });
}

var exist_rule = function(callback){
  var params = {
    Limit: 1,
    NamePrefix: StathamRuleName
  };
  cloudwatchevents.listRules(params, function(err, data) {
    if (err){
      console.log(err, err.stack);
      callback(false);
    }
    else{
      if(data.Rules.length == 1) callback(true);
      else callback(false);
    }
  });
}

var get_lambda = function(callback){
  var params = {
    FunctionName: "StathamService-dev-worker"
  };
  lambda.getFunction(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else
      callback(data.Configuration.FunctionArn);
  });
}
