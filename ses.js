'use strict';

var fs                = require('fs');
var ejs               = require('ejs');
var AWS               = require('aws-sdk');

AWS.config.loadFromPath('./credentials.json');

var ses               = new AWS.SES();

var to = ['***REMOVED***'];
var from = '***REMOVED***';

module.exports.mail_message_generator = function(message){
  render_body_html(message, function(data){
    ses.sendEmail({
      Source: from,
      Destination: { ToAddresses: to },
      Message: {
          Subject:{
             Data: 'The Transporter'
          },
          Body: {
              Html: {
                  Data: data
              }
          }
      }
    }
    , function(err, data) {
        if(err) console.log(err);
      });
  })
}

var render_body_html = function(message, callback){
  fs.readFile('email.html', 'utf8', function (err,data) {
    if (err) {
      console.log(err);
    }
    var data_message = ejs.render(data, {
        method      : message.method,
        destination : message.destination,
        source      : message.source,
        url         : message.url,
        error       : message.error,
        body        : JSON.stringify(message.body)
    });
    callback(data_message);
  });

}
