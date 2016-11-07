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


module.exports = {
  createEvent: createEvent,
  home: home
}
