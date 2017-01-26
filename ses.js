'use strict';

var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var ses = new AWS.SES();
// send to list
var to = ['***REMOVED***']
// this must relate to a verified SES account
var from = '***REMOVED***'

// this sends the email
module.exports.mail_message_generator = function(){
  ses.sendEmail({ 
    Source: from, 
    Destination: { ToAddresses: to },
    Message: {
        Subject:Source {
           Data: 'A Message To You Rudy'
        },
        Body: {
            Text: {
                Data: 'Stop your messing around',
            }
        }
    }
  }
  , function(err, data) {
      if(err) throw err
          console.log('Email sent:');
          console.log(data)console;
 });