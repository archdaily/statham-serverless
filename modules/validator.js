var jwt = require('jsonwebtoken');
var url = require('url');

var credentials = require('nconf').file('credentials.json');
var secretToken = credentials.get('secretToken');

module.exports.getParams = function(email, event, callback) {
  var params = getParameters(email, event);
  if (!params) callback(err("Bad auth.", 401));
  else if (!verifyURL(params.url)) callback(err("Bad url.", 400));
  else if (!verifyBody(params.body)) callback(err("Bad body.", 400));
  else if (!verifyMethod(params.method)) callback(err("Bad method.", 400));
  else callback(null, params);
};

var err = function(message, code) {
  var err = {
    message: message,
    code: code
  }
  return err;
}

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

var verifyURL = function(url_msg) {
  if (!url_msg || url_msg == '') return false;
  var urlObj = url.parse(url_msg);
  if (!(urlObj.protocol == 'http:' || urlObj.protocol == 'https:'))
    return false;
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