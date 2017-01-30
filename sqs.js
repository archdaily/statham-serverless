'use strict';

var AWS               = require('aws-sdk');
var async             = require('async');
var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
var trunkURL          = 'https://sqs.us-west-2.amazonaws.com/451967854914/Statham-trunk';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var sqs  = new AWS.SQS();

module.exports.get_list_trunk = function(callback){
  get_count_trunk_async(function(count){
    var messagesJSON = {
      'Messages' : []
    };
    async.times(count, function (n, next){
      get_message_trunk_async(function(response){
        messagesJSON['Messages'].push(response);
        next();
      });
    }, function() {
      callback(messagesJSON);
    });
  });
}

module.exports.delete_msg_trunk = function(ReceiptHandle, callback){
  var params = {
  QueueUrl: trunkURL,
  ReceiptHandle: ReceiptHandle
 };
 sqs.deleteMessage(params, function(err, data) {
   if (err) console.log(err, err.stack);
   callback();
 });
}

module.exports.get_count_trunk = function(callback){
  get_count_trunk_async(function(response){
    callback(response);
  });
}

var get_message_trunk_async = function(callback){
  var params = {
  AttributeNames: [
     "All"
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
     "All"
  ],
  QueueUrl: trunkURL,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 10
 };
 sqs.receiveMessage(params, function(err, data) {
   if (err) console.log(err, err.stack);
   else{
     var message = {
       'Message' : JSON.parse(data.Messages[0].Body).Message,
       'MessageId' : data.Messages[0].MessageId,
       'ReceiptHandle' : data.Messages[0].ReceiptHandle
     };
     callback(message);
   }
 });
}

var get_count_trunk_async = function(callback){
  var params = {
    AttributeNames: [
      "All"
    ],
    QueueUrl: trunkURL
  };
  sqs.getQueueAttributes(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      var number = data.Attributes.ApproximateNumberOfMessages;
      callback(number);
    }
});
}
