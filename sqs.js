'use strict';

var AWS               = require('aws-sdk');
var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var sqs  = new AWS.SQS();

module.exports.get_count_trunk = function(callback){
  get_count_trunk_async(function(response){
    callback(response);
  });
}
var get_count_trunk_async = function(callback){
  var params = {
    AttributeNames: [
      "All"
    ],
    QueueUrl: "https://sqs.us-west-2.amazonaws.com/451967854914/Statham-trunk"
  };
  sqs.getQueueAttributes(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      var number = data.Attributes.ApproximateNumberOfMessages;
      callback(number);
    }
});
}
