/* eslint no-console:0 */
var google = require('googleapis')
var calendar = google.calendar('v3')
// var event = require('./events.js')


/**
 * Gets all the calendars for an account
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {function} callback function to be called after API call is made
 */
function getCalendars (oauth2Client, callback) {
  calendar.calendarList.list({
    auth: oauth2Client
  }, (err, response) => {
    if (err) {
      console.error('The API returned: ' + err)
    } else {
      var calendars = response.items
      if (calendars.length === 0) {
        callback('No upcoming events')
      } else {
        callback(calendars)
      }
    }
  })
}

// module.exports = getEvents

module.exports = {
  getCalendars: getCalendars
}
