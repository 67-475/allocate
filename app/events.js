/* eslint no-console:0 */
var google = require('googleapis')
var calendar = google.calendar('v3')


/**
 * Creates a Google Calendar event with a given calendar ID
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {Object} event Event data to be pushed to Google
 * @param {string} event.start Start time for event
 * @param {string} event.end End time for event
 * @param {string} event.title Title text for event
 * @param {function} callback function to be called after API call is made
 * @param {String} calendarId Calendar on which to put this event, defaults to primary
 */
function createEvent(oauth2Client, event, callback, calendarId = 'primary') {
  calendar.events.insert({
    auth: oauth2Client,
    calendarId: calendarId,
    timeMax: event.start,
    timeMin: event.end,
    text: event.title
  }, (err, response) => {
    if (err) {
      console.error(err.stack)
    } else {
      console.log(response)
      callback(response)
    }
  })
}

module.exports = createEvent
