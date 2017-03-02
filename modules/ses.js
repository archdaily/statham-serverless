'use strict';

var fs = require('fs');
var ejs = require('ejs');
var AWS = require('aws-sdk');
var config = require('nconf').file('config.json');
var utilities = require('./utilities');

AWS.config.loadFromPath('./credentials.json');

var ses = new AWS.SES();

var to = [config.get('ToEmailNotification')];
var from = config.get('FromEmailNotification');

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
    }, function(err, data) {});
  })
}

var render_body_html = function(message, callback) {
  fs.readFile('views/email.html', 'utf8', function(err, data) {
    var data_message = ejs.render(data, {
      lambda: message.resource,
      method: message.method,
      destination: message.destination,
      origin: message.origin,
      url: message.url,
      error: message.error,
      token: utilities.create_token("email"),
      body: JSON.stringify(message.body)
    });
    callback(data_message);
  });

}