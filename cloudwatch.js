'use strict';

var AWS               = require('aws-sdk');
var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var cloudwatchevents  = new AWS.CloudWatchEvents();

module.exports.enable_rule = function(){
  var params = {
    Name: 'Statham-cycle',
    ScheduleExpression: 'cron(0/2 * * * ? *)',
    State: 'ENABLED'
  };
  cloudwatchevents.putRule(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
}

module.exports.disable_rule = function(){
  var params = {
    Name: 'Statham-cycle',
    ScheduleExpression: 'cron(0/2 * * * ? *)',
    State: 'DISABLED'
  };
  cloudwatchevents.putRule(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });

}
