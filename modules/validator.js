var jwt = require('jsonwebtoken');
var url = require('url');

var credentials = require('nconf').file('credentials.json');
var secretToken = credentials.get('secretToken');

module.exports.getParams = function(email, event, callback) {
  if (!verifyTokenRequest(event, email)) callback(err("Bad auth.", 401));
  else {
    var params = getParameters(email, event);
    var error = "";
    if (!verifyURL(params.url)) error += "Bad URL. ";
    if (!verifyMethod(params.method)) error += "Bad method. ";
    if (!verifyBody(params.body))
      if (params.method != 'GET') error += "Bad body. ";
    if (error == "") callback(null, params);
    else callback(err(error, 400));
  }
};

var err = function(message, code) {
  var err = {
    message: message,
    code: code
  }
  return err;
}

var getParameters = function(email, event) {
  var params, message;
  if (email) message = event.queryStringParameters;
  else message = JSON.parse(event.body);
  params = {
    "url": message.url,
    "method": message.method,
    "body": message.body
  }
  try {
    params.method = params.method.toUpperCase();
    params.body = JSON.parse(params.body);
  } catch (err) {}
  return params;
}

var verifyTokenRequest = function(event, email) {
  if (email)
    if (verifyTokenStringParameter(event)) return true;
    else return false;
  else
  if (verifyTokenHeader(event)) return true;
  else return false;
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
  if (method == 'POST' || method == 'GET')
    return true;
  return false;
}