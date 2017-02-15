'use strict';

var fs = require('fs');
var ejs = require('ejs');
var AWS = require('aws-sdk');
var config = require('nconf').file('config.json');
var utilities = require('utilities');

AWS.config.loadFromPath('./credentials.json');

var ses = new AWS.SES();

var to = [config.get('EmailNotification')];
var from = config.get('EmailNotification');

module.exports.mail_message_generator = function(message) {
  render_body_html(message, function(data) {
    ses.sendEmail({
      Source: from,
      Destination: { ToAddresses: to },
      Message: {
        Subject: {
          Data: 'The Transporter'
        },
        Body: {
          Html: {
            Data: data
          }
        }
      }
    }, function(err, data) {
      if (err) console.log(err);
    });
  })
}

var render_body_html = function(message, callback) {
  fs.readFile('views/email.html', 'utf8', function(err, data) {
    if (err) {
      console.log(err);
    }
    var data_message = ejs.render(data, {
      lambda: message.resource,
      method: message.method,
      destination: message.destination,
      source: message.source,
      url: message.url,
      error: message.error,
      token: utilities.createToken("email"),
      body: JSON.stringify(message.body)
    });
    callback(data_message);
  });

}