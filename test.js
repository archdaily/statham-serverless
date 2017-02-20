var chai = require('chai');
var expect = chai.expect;
var config = require('nconf').file('credentials.json');

var pass = config.get("passwordJWK");

var testEvent = require('./test-event');

var utilities = require('./modules/utilities');
var receiver = require('./handlers/receiver');
var auth = require('./handlers/auth');

describe('receiver', function() {
  describe('#receiveAndSendMessage()', function() {
    it("should send without error", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": "https://5wfzggu2zi.execute-api.us-west-2.amazonaws.com/dev/testingDestination"
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          console.log(body.Status);
          if (response.statusCode == 200) done();
          else done(body.Status);
        });
    });
  })
});

describe('receiver', function() {
  describe('#receiveAndSendMessage()', function() {
    it("should send message to the queue", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": "https://url-mala-5wfzggu2zi.execute-api.us-west-2.amazonaws.com/dev/testingDestination"
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          console.log(body.Status);
          if (response.statusCode == 200) done();
          else done(body.Status);
        });
    });
  })
});

describe('receiver', function() {
  describe('#receiveAndSendMessage() null method', function() {
    it("should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": "https://5wfzggu2zi.execute-api.us-west-2.amazonaws.com/dev/testingDestination"
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          console.log(body.Status);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
  })
});