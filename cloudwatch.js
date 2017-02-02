'use strict';

var AWS                 = require('aws-sdk');
var Key_Id              = 'A***REMOVED***';
var secretAccessKey     = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var cloudwatchevents    = new AWS.CloudWatchEvents();
var lambda              = new AWS.Lambda();
var scheduleExpression  = 'cron(0/1 * * * ? *)';
var lambdaArn           = "arn:aws:lambda:us-west-2:451967854914:function:msgService-dev-send";

module.exports.enable_rule = function(){
  exist_rule(function(exist){
    var params = {
      Name: 'Statham-cycle',
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
    Name: 'Statham-cycle',
    ScheduleExpression: scheduleExpression,
    State: 'DISABLED'
  };
  cloudwatchevents.putRule(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
}

var put_lambda_target = function(){
  var params = {
    Rule: 'Statham-cycle',
    Targets: [
      {
        Arn: lambdaArn,
        Id: "Lambda-Worker"
      }
    ]
  };
  cloudwatchevents.putTargets(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
}

var add_permission_trigger_lambda = function(ruleArn){
  var params = {
    Action: "lambda:InvokeFunction",
    FunctionName: lambdaArn,
    Principal: "events.amazonaws.com",
    SourceArn: ruleArn,
    StatementId: "ID-1"
  };
  lambda.addPermission(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
}

var exist_rule = function(callback){
  var params = {
    Limit: 1,
    NamePrefix: 'Statham-cycle'
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
