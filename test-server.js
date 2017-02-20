var express = require('express');
var bodyParser = require('body-parser');
var testEvent = require('./test-event');
var auth = require('./handlers/auth')
var receiver = require('./handlers/receiver');
var config = require('nconf').file('credentials.json');

var pass = config.get("passwordJWK");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/receiver', function(req, res) {
  testEvent.queryStringParameters = req.query;
  testEvent.httpMethod = "GET";
  testEvent.path = '/receiver';
  testEvent.resource = '/receiver';
  testEvent.sourceIp = "";
  receiver.emailResend(testEvent, null, function(err, response) {
    res.statusCode = 200;
    res.send(response.body);
  });
});

app.post('/receiver', function(req, res) {
  testEvent.body = JSON.stringify(req.body);
  testEvent.headers.Authorization = req.headers.authorization;
  testEvent.httpMethod = "POST";
  testEvent.path = '/receiver';
  testEvent.resource = '/receiver';
  testEvent.sourceIp = "";
  receiver.receiveAndSendMessage(testEvent, null, function(err, response) {
    res.statusCode = 200;
    res.send(JSON.parse(response.body));
  });
});

app.get('/getToken', function(req, res) {
  testEvent.headers.Authorization = req.headers.authorization;
  testEvent.httpMethod = "GET";
  testEvent.path = '/getToken';
  testEvent.resource = '/getToken';
  testEvent.sourceIp = "";
  auth.getToken(testEvent, null, function(err, response) {
    if (response.statusCode == 400) {
      res.statusCode=400;
      res.send("Error: invalid or missing password");
    }
    else{
      res.statusCode = 200;
      res.send({
        token: JSON.parse(response.body).token
      }); 
    }
  });
});

app.listen(8000, function() {
  console.log('Statham listening on port 8000!');
});