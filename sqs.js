'use strict';

var async             = require('async');
var utilities         = require('utilities');
var AWS               = require('aws-sdk');
var config            = require('nconf').file('config.json');

AWS.config.loadFromPath('./credentials.json');

var trunkURL          = config.get('TrunkURL');
var sqs  = new AWS.SQS();

var messagesJSON = {
    'Messages' : []
};

module.exports.get_list_trunk = function(callback){
  messagesJSON.Messages = [];
  async.forever(
    function(next){
      get_message_trunk_async(function(err, response){
        if(err) next(err);
        else{
          next();
        }
      });
    },
    function(err){
      callback(messagesJSON);
    }
  );
}

module.exports.delete_msg_trunk = function(ReceiptHandle){
  delete_msg_trunk_internal(ReceiptHandle);
}

module.exports.send_msg_trunk = function(message){
  var params = {
    MessageAttributes: {
      "method": {
        DataType: "String",
        StringValue: message.method
      },
      "url": {
        DataType: "String",
        StringValue: message.url
      },
      "source": {
        DataType: "String",
        StringValue: message.source
      },
      "id": {
        DataType: "String",
        StringValue: message.id
      },
      "destination": {
        DataType: "String",
        StringValue: message.destination
      },
      "error": {
        DataType: "String",
        StringValue: message.error
      },
      "tries": {
        DataType: "Number",
        StringValue: message.tries.toString()
      }
    },
    MessageBody: JSON.stringify(message.body),
    QueueUrl: trunkURL,
    MessageDeduplicationId: message.id,
    MessageGroupId: "Trunk"
  };
  sqs.sendMessage(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
}

module.exports.get_count_trunk = function(callback){
  get_count_trunk_async(function(response){
    callback(response);
  });
}

var delete_msg_trunk_internal = function(ReceiptHandle){
  var params = {
    QueueUrl: trunkURL,
    ReceiptHandle: ReceiptHandle
  };
  sqs.deleteMessage(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
}

var get_message_trunk_async = function(callback){
  var params = {
    AttributeNames: [
      "All"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: trunkURL
  };
  sqs.receiveMessage(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else{
      if(data.Messages){
        var messages = [];
        for(var i = 0; i < data.Messages.length; i++){
          var message_statham = {
            'Message' : {
              'method' : data.Messages[i].MessageAttributes.method.StringValue,
              'url' : data.Messages[i].MessageAttributes.url.StringValue,
              'destination' : data.Messages[i].MessageAttributes.destination.StringValue,
              'error' : data.Messages[i].MessageAttributes.error.StringValue,
              'id' : data.Messages[i].MessageAttributes.id.StringValue + utilities.get_random_char(),
              'source' : data.Messages[i].MessageAttributes.source.StringValue,
              'tries' : parseInt(data.Messages[i].MessageAttributes.tries.StringValue),
              'body' : JSON.parse(data.Messages[i].Body)
            },
            'MessageId' : data.Messages[i].MessageId,
            'ReceiptHandle' : data.Messages[i].ReceiptHandle
          };
          messagesJSON['Messages'].push(message_statham);
          delete_msg_trunk_internal(data.Messages[i].ReceiptHandle);
        }
        callback(null, messages);
      }
      else{
        callback("SQS empty");
      }
    }
  });
}

var set_sqs_data_route = function(){

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
