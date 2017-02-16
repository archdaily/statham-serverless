'use strict'

var utilities = require('modules/utilities');
var config = require('nconf').file('credentials.json');

var pass = config.get("passwordJWK");

module.exports.getToken = (event, context, callback) => {
  if (event.headers.Authorization == pass) {
    utilities.make_json_response(function(response) {
        callback(null, response);
      },
      200, {
        "token": utilities.createToken(event.requestContext.identity.sourceIp)
      });
  } else {
    utilities.make_json_response(function(response) {
        callback(null, response);
      },
      400, {
        "Error": "Invalid or Missing Authorization"
      });
  }
};