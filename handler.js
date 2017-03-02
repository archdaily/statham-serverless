'use strict';
/// JUST TO TEST STATHAM ///
module.exports.tester = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event.body
    })
  };
  callback(null, response);
};