/* eslint no-console:0 */
var google = require('googleapis')
var calendar = google.calendar('v3')

/**
 * Creates a Google Calendar event with a given calendar ID
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {Object} event Event data to be pushed to Google
 * @param {Date} event.start Start time for event
 * @param {Date} event.end End time for event
 * @param {string} event.summary Summary text for event
 * @param {function} callback function to be called after API call is made
 * @param {String} calendarId Calendar on which to put this event, defaults to primary
 */
function createEvent(oauth2Client, event, callback, calendarId = 'primary') {
  const start = event.start.toISOString()
  const end = event.end.toISOString()

  calendar.events.insert({
    auth: oauth2Client,
    calendarId: calendarId,
    resource: {
      start: { dateTime: start },
      end: { dateTime: end },
      summary: event.summary
    }
  }, (err, response) => {
    if (err) {
      console.error(err.stack)
    } else {
      callback(response)
    }
  })
}

module.exports = createEvent
