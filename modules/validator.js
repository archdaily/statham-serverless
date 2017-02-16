var jwt = require('jsonwebtoken');

var credentials = require('nconf').file('credentials.json');
var secretToken = credentials.get('secretToken');

module.exports.validateParams = function(email, event) {
  try {
    var params = getParameters(email, event);
  } catch (err) {
    return null;
  }
  if (!params) return null;
  if (!verifyURL(params.url)) return null;
  if (!verifyBody(params.body)) return null;
  if (!verifyMethod(params.method)) return null;
  return params;
};

var getParameters = function(email, event) {
  var params;
  if (email) {
    if (!verifyTokenStringParameter(event)) return null;
    params = {
      "url": event.queryStringParameters.url,
      "method": "POST",
      "body": event.queryStringParameters.body
    }
  } else {
    if (!verifyTokenHeader(event)) return null;
    var body = JSON.parse(event.body);
    params = {
      "url": body.url,
      "method": body.method,
      "body": body.body
    }
  }
  return params;
}

var verifyTokenHeader = function(event) {
  if (!event.headers.Authorization) {
    return false;
  }
  var tokenJWT = event.headers.Authorization;

  return verifyToken(tokenJWT);
}

var verifyTokenStringParameter = function(event) {
  if (!event.queryStringParameters) return false;
  else if (!event.queryStringParameters.token) return false;

  var tokenJWT = event.queryStringParameters.token;

  return verifyToken(tokenJWT);
}

var verifyToken = function(token) {
  try {
    var decoded = jwt.verify(token, secretToken);
    return true;
  } catch (err) {
    return false;
  }
}

var verifyURL = function(url) {
  if (!url || url == '') return false;
  return true;
}

var verifyBody = function(body) {
  if (!body) return false;
  for (var i in body) { return true; }
  return false;
}

var verifyMethod = function(method) {
  if (!method) return false;
  if (method.toUpperCase() == 'POST' || method.toUpperCase() == 'GET')
    return true;
  return false;
}