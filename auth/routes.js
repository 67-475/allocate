var request = require('request')
var scrambler = require('./scrambler')
var google = require('googleapis')
var OAuth2 = google.auth.OAuth2

var levelup = require('levelup')
var levelupDB = levelup('./db', { valueEncoding: 'json' })

// preprocess client and login link
var credentials = require('../config/config.js')
var oauth2Clients = {}

/**
 * Create a new OAuth2 Client with the correct credentials
 * @return {OAuth2} new instance of OAuth2 to be used to authenticate user
 */
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
  'https://www.googleapis.com/auth/plus.login'
]
var login_link = server_auth.generateAuthUrl({
  scope: scopes.join(' '),
  redirect_uri: credentials.redirect_uri
})

/**
 * Middleware to check whether or not user is logged
 * and correctly authorized
 * @param {Object} req Express.js request
 * @param {Object} res Express.js response
 * @param  {Function} next next piece of request handling
 */
function is_logged_in (req, res, next) {
  if (req.cookies.auth && scrambler.decrypt(req.cookies.auth) in oauth2Clients) {
    next()
  } else {
    res.redirect('/login')
  }
}

/**
 * Render login page with correct link
 * @param {Object} req Express.js request
 * @param {Object} res Express.js response
 */
function login (req, res) {
  res.render('login', {
    auth_url: login_link
  })
}

/**
 * Callback URL for Google OAuth logout
 * https://developers.google.com/google-apps/tasks/oauth-authorization-callback-handler
 * @param {Object} req Express.js request
 * @param {Object} res Express.js response
 */
function logout (req, res) {
  const cookie = scrambler.decrypt(req.cookies.auth)
  var leaving = oauth2Clients[cookie]
  delete oauth2Clients[cookie]
  res.clearCookie('auth')

  leaving.revokeCredentials(() => { res.redirect('/login') })
}

/**
 * Callback URL for Google OAuth login
 * https://developers.google.com/google-apps/tasks/oauth-authorization-callback-handler
 * @param {Object} req express.js request
 * @param {Object} res express.js response
 */
function authorize (req, res) {
  server_auth.getToken(req.query.code, (googleErr, token) => {
    if (!googleErr) {
      const options = {
        url: 'https://people.googleapis.com/v1/people/me?fields=emailAddresses&key=' + credentials.api_key,
        headers: {
          Authorization: token.token_type + ' ' + token.access_token
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
/**
 * Get events from Google Calendar
 * @param  {Object} req express.js request
 * @param  {Object} res express.js response
 */
function getHomeEvent(req, res) {
  const email = scrambler.decrypt(req.cookies.auth)
  var client = oauth2Clients[email]

  home(client, (events) => {
    res.render('home', {
      events: events,
      email: email
    })
  })
}

function getSettings(req, res) {
  var email = scrambler.decrypt(req.cookies.auth)
  levelupDB.get(email, function(err, results) {
    if (err) {
      console.error(err)
      res.render('settings')
    } else {
      console.log(results, results.bestTime, results.sleepTime)
      res.render('settings', {settings: results})
    }
  })
}

function postSettings(req, res) {
  var reqEmail = req.params.email
  var email = scrambler.decrypt(req.cookies.auth)

  if (reqEmail != email) {
    res.send(304)
    return
  }

  email = reqEmail
  levelupDB.put(email, req.body, function(err) {
    if (err) {
      console.error(err)
      res.send(304)
    } else {
      res.send(200)
    }
  })
}

exports.init = (app) => {
  app.get('/login', login)
  app.get('/logout', is_logged_in, logout)
  app.get('/auth', authorize)
  app.get('/', is_logged_in, getHomeEvent)
  app.get('/settings', is_logged_in, getSettings)
  app.post('/settings/:email', is_logged_in, postSettings)
}

// for levelup testing purposes
var object = {
  bestTime: "m",
  sleepTime: ["0000", "0800"]
}
levelupDB.put("jormond@andrew.cmu.edu", object, function(err) {
  if (err) {
    conole.error(err)
  }
})
