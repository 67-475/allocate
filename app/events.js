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
function persistEvent(oauth2Client, event, callback, calendarId = 'primary') {
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

const ONE_DAY = 1000 * 60 * 60 * 24
/**
 * Format events based on given input
 * @param {Date} start
 * @param {Integer} length of event in hours
 * @param {Integer} daysAfter
 * @param {String} summary
 * @return {Object} event
 */
function createAllocatedEvent(start, length, summary, daysAfter) {
  return {
    start: start.getTime() + ONE_DAY * daysAfter,
    end: start.getTime() + ONE_DAY * daysAfter + (length * 1000 * 60 * 60),
    summary: summary + " Part " + (daysAfter + 1)
  }
}

/**
 * Whether two events Overlap
 * @param  {Object} allocatedEvent
 * @param  {Object} calendarEvent
 * @return {boolean} result
 */
function doesOverlap(allocatedEvent, calendarEvent) {
  console.log(allocatedEvent, calendarEvent)
  return false
}

/**
 * Format Date to conform with what Google APIs want
 * @param {Date} date
 * @return {String} representation
 */
function formatDate (date) {
  var iso = date.toISOString()
  iso = iso.substring(0, iso.length - 1)
  var offset = (date.getTimezoneOffset() / 100) + 1 + ":00"
  if (offset.length < 5) {
    offset = "0" + offset
  }

  return iso + "-" + offset
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
    fields: "items(end/dateTime,start/dateTime,summary)",
    singleEvents: true
  }, (err, response) => {
    if (err) {
      callback(err)
    } else {
      callback(undefined, response.items)
    }
  })
}

module.exports = {
  getEvents,
  doesOverlap,
  createAllocatedEvent
}
