'use strict';
var AWS               = require('aws-sdk');
var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var ses               = new AWS.SES();
var fs                = require('fs');
var ejs               = require('ejs');
// send to list
var to = ['***REMOVED***'];
// this must relate to a verified SES account
var from = '***REMOVED***';

// this sends the email
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
    console.log(data_message);
    ///data_message = data_message.replace(',', '<br>');
    ///console.log(data_message);
    callback(data_message);
  });

}










