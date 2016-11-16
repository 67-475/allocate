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
  * @param {Object} project Project in which the span of events are
  * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                 with which to make API call
  * @param {function} callback function to be called with results of API call
  */
function getEvents (project, oauth2Client, callback) {
  calendar.events.list({
    auth: oauth2Client,
    calendarId: 'primary',
    timeMax: formatDate(project.end),
    timeMin: formatDate(project.start),
  }, (err, response) => {
    if (err) {
      callback(err)
    } else {
      callback(undefined, response.items)
    }
  })
}

function formatDate (date) {
  var iso = date.toISOString()
  iso = iso.substring(0, iso.length - 1)
  var offset = (date.getTimezoneOffset() / 100) + 1
  offset = offset + ":00"
  if (offset.length < 5) {
    offset = "0" + offset
  }

  return iso + "-" + offset
}


module.exports = {
  createEvent: createEvent,
  getEvents: getEvents
}
