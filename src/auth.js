'use strict'

var utilities         = require('utilities');
var config            = require('nconf').file('config.json');

var AuthIps = config.get("AuthIps");

module.exports.getToken = (event, context, callback) => {
  if(AuthIps.contains(event.requestContext.identity.sourceIp)){
    callback(null, utilities.make_json_response(200,{
      "token" : utilities.createToken(event.requestContext.identity.sourceIp)
    }));
  }
  else{
    callback(null, utilities.make_json_response(400,{
      "error" : "Unidentified access"
    }));
  }
};
