'use strict';

var async = require('async');
var chai = require('chai');
var expect = chai.expect;

var testEvent = require('../test-event');

var sqs = require("../modules/sqs");
var utilities = require("../modules/utilities");
var worker = require("../handlers/worker");

var urlDest =
  "https://5wfzggu2zi.execute-api.us-west-2.amazonaws.com" +
  "/dev/testingDestination";

var testMsg = {
  method: "POST",
  body: "body",
  url: urlDest,
  destination: "/dev/testingDestination",
  origin: "origin",
  resource: "resource",
  tries: 0,
  error: "error"
};

describe('worker', function() {
  describe('#workFromTrunk()', function() {
    it("good url: should leave the SQS empty", function(done) {
      this.timeout(50000);
      sqs.create_get_queue_url("StathamDevelopTrunk", function(TrunkUrl) {
        async.series([
            function(callback) {
              testMsg.destination = "dest1";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            },
            function(callback) {
              testMsg.destination = "dest1";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            },
            function(callback) {
              testMsg.destination = "dest2";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            },
            function(callback) {
              testMsg.destination = "dest3";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            }
          ],
          function(err, results) {
            worker.workFromTrunk(testEvent, null, function(err, response) {
              sqs.get_count_queue(TrunkUrl, function(number) {
                if (number == 0) done();
                else done(number + " messages on SQS!");
              });
            });
          }
        );
      });
    });
    it("bad url: should leave 4 messages on SQS", function(done) {
      testMsg.url = "https://bad-url/endpoint";
      this.timeout(50000);
      sqs.create_get_queue_url("StathamDevelopTrunk", function(TrunkUrl) {
        async.series([
            function(callback) {
              testMsg.destination = "dest1";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            },
            function(callback) {
              testMsg.destination = "dest1";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            },
            function(callback) {
              testMsg.destination = "dest2";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            },
            function(callback) {
              testMsg.destination = "dest3";
              testMsg.id = get_new_id();
              sqs.send_msg_queue(testMsg, TrunkUrl, function(res) {
                callback();
              });
            }
          ],
          function(err, results) {
            worker.workFromTrunk(testEvent, null, function(err, response) {
              sqs.get_count_queue(TrunkUrl, function(number) {
                if (number == 4) done();
                else done(number + " messages on SQS!");
              });
            });
          }
        );
      });
    });
  });
});

describe('Purge Queue', function() {
  it("Delete all elements from develop Trunk", function(done) {
    this.timeout(20000);
    sqs.create_get_queue_url("StathamDevelopTrunk", function(TrunkUrl) {
      sqs.get_list(TrunkUrl, function(messages) {
        done();
      });
    });
  });
});

var get_new_id = function() {
  return utilities.get_random_char() +
    utilities.get_random_char() +
    utilities.get_random_char();
}