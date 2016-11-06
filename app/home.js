/* eslint no-console:0 */

var google = require('googleapis')
var calendar = google.calendar('v3')

/**
  * Pulls Google Calendar events given a client
  * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                 with which to make API call
  * @param {function} callback function to be called with results of API call
  */
function home (oauth2Client, callback) {
  calendar.events.list({
    auth: oauth2Client,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, response) => {
    if (err) {
      console.error('The API returned: ' + err)
    } else {
      var events = response.items
      if (events.length === 0) {
        callback('No upcoming events')
      } else {
        callback(events)
      }
    }
  })
}

module.exports = home
