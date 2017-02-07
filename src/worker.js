'use strict';


module.exports.workFromTrunk = (event, context, callback) => {
  sqs.get_list_trunk(function(listMsg){
    process_list_concurrently(listMsg);
  });
}

var process_list_concurrently = function(listMsg){
  async.every(listMsg.Messages, function(message, next){
    Message.send(message, function(sent){
      next(null, sent);
    });
  }, function(sent, result) {
    if(result) cloudwatch.disable_rule();
    else cloudwatch.enable_rule();
  });
}
