'use strict';

var async = require('async');
var utilities = require('./utilities');
var AWS = require('aws-sdk');
var config = require('nconf').file('config.json');

AWS.config.loadFromPath('./credentials.json');

AWS.config.region = "us-west-2";

var sqs = new AWS.SQS();

module.exports.create_get_queue_url = function(Queue, callback) {
  var params = {
    QueueName: Queue + '.fifo',
    Attributes: {
      ReceiveMessageWaitTimeSeconds: "0",
      FifoQueue: "true",
      ContentBasedDeduplication: "true"
    }
  };
  sqs.createQueue(params, function(err, data) {
    if (err) console.log(err)
    else {
      callback(data.QueueUrl);
    }
  });
}

module.exports.get_list = function(QueueURL, callback) {
  var messages = [];
  async.during(
    function(condition) {
      console.log("cond");
      get_count(QueueURL, function(number) {
        condition(null, number > 0);
      });
    },
    function(callback) {
      console.log("fn");
      get_messages(QueueURL, function(err, response) {
        if (!err) messages = messages.concat(response);
        callback();
      });
    },
    function(err) {
      console.log("finish");
      callback(messages);
    }
  );
}

module.exports.send_msg_queue = function(message, QueueURL, callback) {
  var params = disarm_message(message, QueueURL);
  sqs.sendMessage(params, function(err, data) {
    if (err) console.log(err);
    callback(data);
  });
}

module.exports.get_count_queue = function(QueueURL, callback) {
  get_count(QueueURL, function(response) {
    callback(response);
  });
}

var delete_msg_queue = function(QueueURL, ReceiptHandle) {
  var params = {
    QueueUrl: QueueURL,
    ReceiptHandle: ReceiptHandle
  };
  sqs.deleteMessage(params, function(err, data) {
    if (err) console.log(err);
  });
}

module.exports.get_messages_queue = function(QueueURL, callback) {
  get_messages(QueueURL, callback);
}

var get_messages = function(QueueURL, callback) {
  var params = receiveMessage_settings(QueueURL);
  sqs.receiveMessage(params, function(err, data) {
    if (err) console.log(err)
    else {
      if (data.Messages) {
        var messages = [];
        for (var i = 0; i < data.Messages.length; i++) {
          var message_statham = recontitution_message(data, i);
          messages.push(message_statham);
          delete_msg_queue(QueueURL, message_statham.ReceiptHandle);
        }
        callback(null, messages);
      } else {
        callback("undefinded");
      }
    }
  });
}

var receiveMessage_settings = function(QueueURL) {
  var params = {
    AttributeNames: [
      "All"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: QueueURL
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
      'origin': attributes.origin.StringValue,
      'tries': parseInt(attributes.tries.StringValue),
      'resource': attributes.resource.StringValue,
      'body': JSON.parse(data.Messages[i].Body)
    },
    'MessageId': data.Messages[i].MessageId,
    'ReceiptHandle': data.Messages[i].ReceiptHandle
  };
  return msg;
}

var disarm_message = function(message, QueueURL) {
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
      "origin": {
        DataType: "String",
        StringValue: message.origin
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
      },
      "resource": {
        DataType: "String",
        StringValue: message.resource
      }
    },
    MessageBody: JSON.stringify(message.body),
    QueueUrl: QueueURL,
    MessageDeduplicationId: message.id,
    MessageGroupId: "Trunk"
  };
  return params;
}

var get_count = function(QueueURL, callback) {
  var params = {
    AttributeNames: [
      "All"
    ],
    QueueUrl: QueueURL
  };
  sqs.getQueueAttributes(params, function(err, data) {
    if (err) console.log(err)
    else {
      var number = data.Attributes.ApproximateNumberOfMessages;
      callback(number);
    }
  });
}

module.exports.purge_queue = function(QueueURL, callback) {
  var params = {
    QueueUrl: QueueURL
  };
  sqs.purgeQueue(params, function(err, data) {
    if (err) console.log(err, err.stack);
    callback(data);
  });
}

module.exports.delete_queue = function(QueueURL, callback) {
  var params = {
    QueueUrl: QueueURL
  };
  sqs.deleteQueue(params, function(err, data) {
    if (err) console.log(err, err.stack);
    callback(data);
  });
}