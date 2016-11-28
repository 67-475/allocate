/* eslint no-console:0 */
var request = require('request')
var google = require('googleapis')
var OAuth2 = google.auth.OAuth2

var scrambler = require('./scrambler')
var db = require('../models/database')

// preprocess client and login link
var credentials = require('../config/config')
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
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/user.emails.read'
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
 * @param {Function} next next piece of request handling
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
        url: 'https://content-people.googleapis.com/v1/people/me?fields=emailAddresses&key=' + credentials.api_key,
        headers: {
          Authorization: token.token_type + ' ' + token.access_token
        },
        method: 'GET'
      }
      request(options, (err, response, body) => {
        try {
          const email = JSON.parse(body).emailAddresses[0].value
          oauth2Clients[email] = generate_auth()
          res.cookie('auth', scrambler.encrypt(email))
          oauth2Clients[email].setCredentials(token)
        } catch (error) {
          console.log(JSON.parse(body))
        } finally {
          res.redirect('/')
        }
      })
    }
  })
}

var calendar = require('../app/calendars.js')
/**
 * Get events from Google Calendar
 * @param {Object} req express.js request
 * @param {Object} res express.js response
 */
function getHomeEvent(req, res) {
  const email = scrambler.decrypt(req.cookies.auth)
  var client = oauth2Clients[email]
  calendar.getCalendars(client, (calendars) => {
    res.render('home', {
      email: email,
      calendars: calendars
    })
  })
}

/**
 * Get the settings page for a user
 * @param {Object} req express.js request
 * @param {Object} res express.js response
 */
function getSettingsPage(req, res) {
  var email = scrambler.decrypt(req.cookies.auth)
  db.get(email, (err, results) => {
    if (err) {
      console.error(err)
      res.render('settings')
    } else {
      console.log(results, results.bestTime, results.sleepTime)
      res.render('settings', { settings: results })
    }
  })
}

/**
 * Getthe settings for a user
 * @param {Object} req express.js request
 * @param {Object} res express.js response
 */
function getSettings(req, res) {
  var email = scrambler.decrypt(req.cookies.auth)
  db.get(email, (err, results) => {
    if (err) {
      console.error(err)
      res.status(304)
    } else {
      res.send(results)
    }
  })
}

/**
 * Post the settings for a user
 * @param {Object} req express.js request
 * @param {Object} res express.js response
 */
function postSettings(req, res) {
  var email = scrambler.decrypt(req.cookies.auth)

  db.put(email, req.body, (err) => {
    if (err) {
      console.error(err)
      res.status(403).send({ errors: err })
    } else {
      res.send(200)
    }
  })
}

const allocate = require('../app/allocate')
/**
 * Allocate events for a user based on a given project
 * @param {Object} req express.js request
 * @param {Object} res express.js response
 */
function postProject(req, res) {
  const email = scrambler.decrypt(req.cookies.auth)
  const client = oauth2Clients[email]
  allocate(client, req.body, res)
}

exports.init = (app) => {
  app.get('/login', login)
  app.get('/logout', is_logged_in, logout)
  app.get('/auth', authorize)
  app.get('/', is_logged_in, getHomeEvent)
  app.get('/settings', is_logged_in, getSettingsPage)
  app.get('/settings/:email', is_logged_in, getSettings)

  app.post('/settings', is_logged_in, postSettings)
  app.post('/allocate', is_logged_in, postProject)
}
