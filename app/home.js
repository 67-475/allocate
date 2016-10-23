return function (req, res) {
  calendar.events.list({
    auth: oauth2Clients[scrambler.decrypt(req.cookies.auth)],
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, response) => {
    if(err) {
      console.log('The API returned: '+ err)
      res.sendStatus(500)
    } else {
      var events = response.items
      if(events.length == 0) {
        res.send('No upcoming events')
      } else {
        events = events.map((event) => event.summary )
        res.send(events)
      }
    }
  })
}