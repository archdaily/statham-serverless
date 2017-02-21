var chai = require('chai');
var expect = chai.expect;
var config = require('nconf').file('credentials.json');

var pass = config.get("passwordJWK");

var testEvent = require('../test-event');

var utilities = require('../modules/utilities');
var receiver = require('../handlers/receiver');

var urlDest = "https://jsonplaceholder.typicode.com/posts";
/*  "https://5wfzggu2zi.execute-api.us-west-2.amazonaws.com" +
  "/dev/testingDestination";*/

describe('receiver', function() {
  describe('#receiveAndSendMessage()', function() {
    it("should send without error", function(done) {
      testEvent.headers.Authorization = utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 200) done();
          else done(body.Status);
        });
    });
    it("should send message to the queue", function(done) {
      testEvent.headers.Authorization = utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": "https://bad-url/so-bad"
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 202) done();
          else done(body.Status);
        });
    });
    it("no auth: should throw error message", function(done) {
      testEvent.headers.Authorization = null;
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 401) done();
          else done(body.Status);
        });
    });
    it("wrong auth: should throw error message", function(done) {
      testEvent.headers.Authorization = "token";
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 401) done();
          else done(body.Status);
        });
    });
    it("int on method: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": 0,
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("empty method: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("no method: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("wrong string method: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "method",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("empty json body: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {},
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("empty string body: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": "",
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("no body: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "url": urlDest
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("empty string url: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": ""
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("no url: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        }
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
    it("wrong protocol url: should throw error message", function(done) {
      testEvent.headers.Authorization =
        utilities.createToken('testing');
      testEvent.body = JSON.stringify({
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": "htttps://url"
      });
      receiver.receiveAndSendMessage(testEvent, null,
        function(err, response) {
          var body = JSON.parse(response.body);
          if (response.statusCode == 400) done();
          else done(body.Status);
        });
    });
  });
  describe('#emailResend()', function() {
    it("should send without error", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 200) done();
          else done(response.statusCode);
        });
    });
    it("should send message to the queue", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": "https://bad-url/so-bad"
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 202) done();
          else done(response.statusCode);
        });
    });
    it("no auth: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 401) done();
          else done(response.statusCode);
        });
    });
    it("wrong auth: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": "token",
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 401) done();
          else done(response.statusCode);
        });
    });
    it("null method: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("int on method should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": 0,
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("no method: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("wrong string method: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "method",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("empty json body: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "body": {},
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("empty string body: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "body": "",
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("no body: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "url": urlDest
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("empty string url: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": ""
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("no url: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        }
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
    it("wrong protocol url: should throw error message", function(done) {
      testEvent.queryStringParameters = {
        "token": utilities.createToken('testing'),
        "method": "POST",
        "body": {
          "value1": "valor1",
          "value2": 2,
          "value3": "value3"
        },
        "url": "htttps://url/"
      };
      receiver.emailResend(testEvent, null,
        function(err, response) {
          if (response.statusCode == 400) done();
          else done(response.statusCode);
        });
    });
  });
});