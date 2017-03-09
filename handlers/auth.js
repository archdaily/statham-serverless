'use strict'

var utilities = require('../modules/utilities');
var config = require('nconf').file('credentials.json');

var pass = config.get("passwordJWT");

module.exports.getToken = (event, context, callback) => {
  if (event.headers.Authorization == pass) {
    utilities.make_json_response(function(response) {
        callback(null, response);
      },
      200, {
        "token": utilities.create_token(event.requestContext.identity.sourceIp)
      });
  } else {
    utilities.make_json_response(function(response) {
        callback(null, response);
      },
      401, {
        "Error": "Invalid or Missing Authorization"
      });
  }
};