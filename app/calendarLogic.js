var google = require('googleapis')
var calendar = google.calendar('v3')

/* takes an oauth2Client, and returns an array of events*/

function getEvents (oauth2Client, callback) {
  calendar.events.list({
    auth: oauth2Client,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, response) => {
    if(err) {
      console.error('The API returned: '+ err)
    } else {
      var events = response.items
      if(events.length == 0) {
        callback('No upcoming events')
      } else {
        callback(events)
      }
    }
  })
}

function getCalendars (oauth2Client, callback) {
  calendar.calendarList.list({
    auth: oauth2Client
  }, (err, response) => {
    if(err) {
      console.error('The API returned: '+ err)
    } else {
      var calendars = response.items
      if(calendars.length == 0) {
        callback('No upcoming events')
      } else {
        callback(calendars)
      }
    }
  })
}

// module.exports = getEvents

module.exports = {
  getEvents: getEvents,
  getCalendars: getCalendars
}