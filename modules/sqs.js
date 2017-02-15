'use strict';

var async = require('async');
var utilities = require('modules/utilities');
var AWS = require('aws-sdk');
var config = require('nconf').file('config.json');

AWS.config.loadFromPath('./credentials.json');

var sqs = new AWS.SQS();

var messagesJSON = {
  'Messages': []
};

module.exports.get_list_trunk = function(callback) {
  messagesJSON.Messages = [];
  async.forever(
    function(next) {
      get_message_trunk_async(function(err, response) {
        if (err) next(err);
        else {
          next();
        }
      });
    },
    function(err) {
      callback(messagesJSON);
    }
  );
}

module.exports.delete_msg_trunk = function(ReceiptHandle) {
  delete_msg_trunk_internal(ReceiptHandle);
}

module.exports.send_msg_trunk = function(message) {
  create_get_trunk_url(function(TrunkURL) {
    var params = disarm_message(message, TrunkURL);
    sqs.sendMessage(params, function(err, data) {
      if (err) console.log(err, err.stack);
    });
  });
}

module.exports.get_count_trunk = function(callback) {
  get_count_trunk_async(function(response) {
    callback(response);
  });
}

var delete_msg_trunk_internal = function(ReceiptHandle) {
  create_get_trunk_url(function(TrunkURL) {
    var params = {
      QueueUrl: TrunkURL,
      ReceiptHandle: ReceiptHandle
    };
    sqs.deleteMessage(params, function(err, data) {
      if (err) console.log(err, err.stack);
    });
  });
}

var get_message_trunk_async = function(callback) {
  create_get_trunk_url(function(TrunkURL) {
    var params = receiveMessage_settings(TrunkURL);
    sqs.receiveMessage(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        if (data.Messages) {
          var messages = [];
          for (var i = 0; i < data.Messages.length; i++) {
            var message_statham = recontitution_message(data, i);
            messagesJSON['Messages'].push(message_statham);
            delete_msg_trunk_internal(data.Messages[i].ReceiptHandle);
          }
          callback(null, messages);
        } else {
          callback("SQS empty");
        }
      }
    });
  });
}

var receiveMessage_settings = function(TrunkURL) {
  var params = {
    AttributeNames: [
      "All"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: TrunkURL
  };
  return params;
}

var recontitution_message = function(data, i) {
  var attributes = data.Messages[i].MessageAttributes;
  var msg = {
    'Message': {
      'method': attributes.method.StringValue,
      'url': attributes.url.StringValue,
      'destination': attributes.destination.StringValue,
      'error': attributes.error.StringValue,
      'id': attributes.id.StringValue + utilities.get_random_char(),
      'source': attributes.source.StringValue,
      'tries': parseInt(attributes.tries.StringValue),
      'body': JSON.parse(data.Messages[i].Body)
    },
    'MessageId': data.Messages[i].MessageId,
    'ReceiptHandle': data.Messages[i].ReceiptHandle
  };
  return msg;
}

var disarm_message = function(message, TrunkURL) {
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
    QueueUrl: TrunkURL,
    MessageDeduplicationId: message.id,
    MessageGroupId: "Trunk"
  };
  return params;
}

var create_get_trunk_url = function(callback) {
  var params = {
    QueueName: 'StathamTrunk.fifo',
    Attributes: {
      ReceiveMessageWaitTimeSeconds: "1",
      FifoQueue: "true",
      ContentBasedDeduplication: "true"
    }
  };
  sqs.createQueue(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      callback(data.QueueUrl);
    }
  });
}

var get_count_trunk_async = function(callback) {
  create_get_trunk_url(function(TrunkURL) {
    var params = {
      AttributeNames: [
        "All"
      ],
      QueueUrl: TrunkURL
    };
    sqs.getQueueAttributes(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else {
        var number = data.Attributes.ApproximateNumberOfMessages;
        callback(number);
      }
    });
  });
}