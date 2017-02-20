var express = require('express');
var bodyParser = require('body-parser');
var lambdaLocal = require('lambda-local');
var testEvent = require('./test-event');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  testEvent.queryStringParameters = req.query;
  var response = lambdaLocal.execute({
    lambdaPath: "handlers/receiver.js",
    lambdaHandler: "emailResend",
    event: testEvent
  });
  res.statusCode = 200;
  res.send("Message sent via get");
});

app.post('/', function(req, res) {
  testEvent.body = JSON.stringify(req.body);
  lambdaLocal.execute({
    lambdaPath: "handlers/receiver.js",
    lambdaHandler: "receiveAndSendMessage",
    event: testEvent
  });
  res.statusCode = 200;
  res.send("Message sent via post");
});

app.listen(8000, function() {
  console.log('Statham listening on port 8000!');
});