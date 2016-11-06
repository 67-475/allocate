var google = require('googleapis')
var calendar = google.calendar('v3')


/**
 * Creates a Google Calendar event with a given calendar ID
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {Object} event Event data to be pushed to Google
 * @param {function} callback function to be called after API call is made
 * @param {String} calendarID Calendar on which to put this event, defaults to primary
 */
function createEvent(oauth2Client, event, callback, calendarID = 'primary') {
  
}
