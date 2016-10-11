var google = require('googleapis')
var calendar = google.calendar('v3')
var OAuth2 = google.auth.OAuth2

// preprocess client and login link
var credentials = require('./config/auth.json')
var oauth2Client = new OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[1]
)

var scope = ['https://www.googleapis.com/auth/calendar'];
var login_link = oauth2Client.generateAuthUrl({
  scope: scope,
  redirect_uri: 'http://localhost:8080/auth'
});

exports.init = (app) => {
  app.get('/login', (req, res) => {
    res.render('login', {
      auth_url: login_link
    })
  })

  app.get('/logout', (req, res) => {
    oauth2Client.revokeCredentials((err, body, response) => {
      res.redirect('/login')
    })
  })

  app.get('/auth', (req, res) => {
    oauth2Client.getToken(req.query.code, (err, token) => {
      if(!err) {
        oauth2Client.setCredentials(token);
      }
      res.redirect('/home');
    })
  })

  app.get('/home', (req, res) => {
    calendar.events.list({
      auth: oauth2Client,
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
          res.send(JSON.stringify(events))
        }
      }
    })
  })
}
