'use strict'

var utilities         = require('utilities');
var config            = require('nconf').file('credentials.json');

var pass = config.get("passwordJWK");

module.exports.getToken = (event, context, callback) => {
  if(event.headers.Password == pass){
    callback(null, utilities.make_json_response(200,{
      "token" : utilities.createToken(event.requestContext.identity.sourceIp)
    }));
  }
  else{
    callback(null, utilities.make_json_response(400,{
      "error" : "Invalid or missing Password"
    }));
  }
};
