var google = require('googleapis')
var identitytoolkit = google.identitytoolkit('v3')
var words = require('random-words')
var scrambler = require('./scrambler')
var OAuth2 = google.auth.OAuth2

// preprocess client and login link
var credentials = require('../config/config.js')
var oauth2Clients = {}

function generate_auth() {
  return new OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uri
  )
}

var server_auth = generate_auth()

var scopes = [
  'https://www.googleapis.com/auth/calendar',
  'profile'
]
var login_link = server_auth.generateAuthUrl({
  scope: scopes.join(' '),
  redirect_uri: credentials.redirect_uri
})

function is_logged_in (req, res, next) {
    if(req.cookies.auth && scrambler.decrypt(req.cookies.auth) in oauth2Clients) {
      next()
    } else {
      res.redirect('/login')
    }
}

function login (req, res) {
  res.render('login', {
    auth_url: login_link
  })
}

function logout (req, res) {
    cookie = scrambler.decrypt(req.cookies.auth)
    var leaving = oauth2Clients[cookie]
    delete oauth2Clients[cookie]
    res.clearCookie('auth')

    leaving.revokeCredentials((err, body, response) => {
      res.redirect('/login')
    })
}

function authorize (req, res) {
  server_auth.getToken(req.query.code, (err, token) => {

    if(!err) {
      const cookie = words({ exactly: 5, join: '-' })
      oauth2Clients[cookie] = generate_auth()
      res.cookie('auth', scrambler.encrypt(cookie))
      oauth2Clients[cookie].setCredentials(token)

      identitytoolkit.relyingparty.getAccountInfo({
        auth: oauth2Clients[cookie]
      }, (err, response) => {
        if(err) {
          console.error(err);
        }
        console.log(response)
        res.redirect('/')
      })
    }

  })
}

var home = require('../app/home.js')

function getHomeEvent(req, res) {
  var client = oauth2Clients[scrambler.decrypt(req.cookies.auth)]

  var events = home(client, (events) => {
    res.render('home', {
      events: events
    })
  })
}

exports.init = (app) => {

  app.get('/login', login)
  app.get('/logout', is_logged_in, logout)
  app.get('/auth', authorize)
  app.get('/', is_logged_in, getHomeEvent)
}
