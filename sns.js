'use strict';

var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var sns = new AWS.SNS();

module.exports.publish_message_sns = function(message, subject, topic){
  var params = serialize_sns(message, subject, topic);
  publish_message_async(params, function(response){
  	return responseSNS;
  });
}

var publish_message_async = function(params, callback){
  sns.publish(params, function(errSNS, dataSNS){
    var responseSNS = sns.get_response(errSNS, dataSNS);
    callback(responseSNS);
  });
}

var serialize_sns = function(message, subject, topic){
  var snsParams = {
    Message: message,
    Subject: subject,
    TopicArn: topic
  };
  return snsParams;
}

var get_response = function(errSNS, dataSNS){
  var responseSNS = "";
  if(errSNS)
    responseSNS = 'Send SNS error: ' + errSNS;
  else
    responseSNS = 'Data: ' + dataSNS;
  return responseSNS;
}