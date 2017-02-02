'use strict';

var AWS               = require('aws-sdk');
var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var cloudwatchevents  = new AWS.CloudWatchEvents();
var lambda            = new AWS.Lambda();

module.exports.enable_rule = function(){
  var params = {
    Name: 'Statham-cycle',
    ScheduleExpression: 'cron(0/1 * * * ? *)',
    State: 'ENABLED'
  };
  cloudwatchevents.putRule(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else{
      put_lambda_target();
      add_permission_trigger_lambda(data.RuleArn);
    }
  });
}

module.exports.disable_rule = function(){
  var params = {
    Name: 'Statham-cycle',
    ScheduleExpression: 'cron(0/1 * * * ? *)',
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
        Arn: "arn:aws:lambda:us-west-2:451967854914:function:msgService-dev-send",
        Id: "Id243536924640"
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
    FunctionName: "arn:aws:lambda:us-west-2:451967854914:function:msgService-dev-send",
    Principal: "events.amazonaws.com",
    SourceArn: ruleArn,
    StatementId: "ID-1"
  };
  lambda.addPermission(params, function(err, data) {
    if (err) console.log(err, err.stack);
});

}
