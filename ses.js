'use strict';
var AWS               = require('aws-sdk');
var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var ses               = new AWS.SES();
var fs                = require('fs')
// send to list
var to = ['***REMOVED***'];
// this must relate to a verified SES account
var from = '***REMOVED***';

// this sends the email
module.exports.mail_message_generator = function(){
  ses.sendEmail({ 
    Source: from, 
    Destination: { ToAddresses: to },
    Message: {
        Subject:{
           Data: 'Mensaje de Statham'
        },
        Body: {
            Html: {
                Data: render_body_html()
            }
        }
    }
  }
  , function(err, data) {
      if(err) console.log(err);
 });
}

var render_body_html = function(){
  fs.readFile('email.html', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
  });
}