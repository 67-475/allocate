var words = require('random-words')
var request = require('request')
var scrambler = require('./scrambler')
var google = require('googleapis')
var OAuth2 = google.auth.OAuth2
var jsonfile = require('jsonfile')

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
  'email',
  'profile',
  'https://www.googleapis.com/auth/plus.login'
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

      const options = {
        url: 'https://people.googleapis.com/v1/people/me\?fields\=emailAddresses\&key\=' + credentials.api_key,
        headers: {
          'Authorization' : token.token_type + ' ' + token.access_token
        },
        method: 'GET'
      }
      request(options, (err, response, body) => {
        const email = JSON.parse(body).emailAddresses[0].value
        oauth2Clients[email] = generate_auth()
        res.cookie('auth', scrambler.encrypt(email))
        oauth2Clients[email].setCredentials(token)
        res.redirect('/')
      })

    }

  })
}

var home = require('../app/home.js')

function getHomeEvent(req, res) {
  email = scrambler.decrypt(req.cookies.auth)
  var client = oauth2Clients[email]

  var events = home(client, (events) => {
    res.render('home', {
      events: events,
      email: email
    })
  })
}

function getSettings(req, res) {
  email = scrambler.decrypt(req.cookies.auth)
  var file = 'db/settings.json'
  jsonfile.readFile(file, function(err, obj) {
    if (obj[email] != null) {
      res.send(obj[email])
    } else {
      res.send("Not found - " + email)
    }
  })

}

exports.init = (app) => {

  app.get('/login', login)
  app.get('/logout', is_logged_in, logout)
  app.get('/auth', authorize)
  app.get('/', is_logged_in, getHomeEvent)
  app.get('/settings', is_logged_in, getSettings)
}
