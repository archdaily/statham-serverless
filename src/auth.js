'use strict'

var utilities         = require('utilities');
var config            = require('nconf').file('credentials.json');

var pass = config.get("passwordJWK");

module.exports.getToken = (event, context, callback) => {
  if(event.headers.Password == pass){
    utilities.make_json_response(function(response){
      callback(null, response);
    },
    200,
    {
      "Token" : utilities.createToken(event.requestContext.identity.sourceIp)
    });
  }
  else{
    utilities.make_json_response(function(response){
      callback(null, response);
    },
    400,
    {
      "Error" : "Invalid or missing password"
    });
  }
};
