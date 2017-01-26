'use strict';
var AWS               = require('aws-sdk');
var Key_Id            = 'A***REMOVED***';
var secretAccessKey   = '***REMOVED***';
AWS.config.update({accessKeyId: Key_Id, secretAccessKey: secretAccessKey});
var ses = new AWS.SES();
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
            Text: {
                Data: 'no se pudo entregar el mensaje',
            }
        }
    }
  }
  , function(err, data) {
      if(err) console.log(err);
 });
}