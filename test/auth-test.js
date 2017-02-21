var chai = require('chai');
var expect = chai.expect;
var config = require('nconf').file('credentials.json');

var pass = config.get("passwordJWK");

var testEvent = require('../test-event');

var utilities = require('../modules/utilities');
var auth = require('../handlers/auth');

describe('auth', function() {
  describe('#getToken()', function() {
    it('good auth: should return status code 200', function(done) {
      testEvent.headers.Authorization = pass;
      auth.getToken(testEvent, null, function(err, response) {
        if (response.statusCode == 200) done();
        else done(response);
      });
    });
    it('incorrect auth: should return status code 401', function(done) {
      testEvent.headers.Authorization = "badauth";
      auth.getToken(testEvent, null, function(err, response) {
        if (response.statusCode == 401) done();
        else done(response);
      });
    });
  });
});