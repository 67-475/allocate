var google = require('googleapis')
var calendar = google.calendar('v3')
var words = require('random-words')
var OAuth2 = google.auth.OAuth2

// preprocess client and login link
var credentials = require('./config/auth.json')
var oauth2Clients = {}

function generate_auth() {
  return new OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[1]
  )
}

var server_auth = generate_auth()

var scope = ['https://www.googleapis.com/auth/calendar'];
var login_link = server_auth.generateAuthUrl({
  scope: scope,
  redirect_uri: 'http://localhost:8080/auth'
});

function is_logged_in (req, res, next) {
    console.log('here')
    console.log(req.cookies)
    if(req.cookies.auth) {
      next()
    } else {
      res.redirect('/login')
    }
}

exports.init = (app) => {
  app.get('/login', (req, res) => {
    res.render('login', {
      auth_url: login_link
    })
  })

  app.get('/logout', (req, res) => {
    var leaving = oauth2Clients[req.cookies.auth]
    delete oauth2Clients[req.cookies.auth]
    res.clearCookie('auth')

    leaving.revokeCredentials((err, body, response) => {
      res.redirect('/login')
    })

  })

  app.get('/auth', (req, res) => {
    server_auth.getToken(req.query.code, (err, token) => {
      const cookie = words({ exactly: 5, join: ' ' })
      oauth2Clients[cookie] = generate_auth()

      res.cookie('auth', cookie)
      if(!err) {
        oauth2Clients[cookie].setCredentials(token)
      }

      res.redirect('/home')
    })
  })

  app.get('/home', is_logged_in, (req, res) => {
    calendar.events.list({
      auth: oauth2Clients[req.cookies.auth],
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
