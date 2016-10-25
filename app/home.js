/* eslint  no-console:0 */

var google = require('googleapis')
var calendar = google.calendar('v3')

/* takes an oauth2client, and returns an array of events */
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
