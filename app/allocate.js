/* eslint no-console:0, block-scoped-var:0, no-loop-func:0, no-param-reassign:0 */
var model = require('../models/event')
var events = require('./events')
var db = require('../models/database')

var moment = require('moment')
var async = require('async')

const ONE_DAY = 1000 * 60 * 60 * 24
const FIFTEEN_MINUTES = 1000 * 60 * 15
const adjustments = {
  m: 0,
  a: 4,
  e: 8,
  n: 12
}
const env = process.env.NODE_ENV || 'development'

/**
 * Actually divide up project into events based on a given email's calendar
 * Will call events.createEvent with each generated event
 * @param {Object} project A description of the overall event
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {function} callback callback to be called when project is allocated
 */
function divvy(project, email, oauth2Client, callback) {
  db.get(email, (dbErr, userSettings) => {
    // make adjustments to when we want to start depending on user's settings
    var proposedStart = moment(userSettings.sleepTimes[1], ['hmm', 'hhmm'])
                              .add(adjustments[userSettings.bestTime], 'hours')
                              .add(moment().isDST() ? 1 : 0, 'hours')
    proposedStart = (env === 'development') ? proposedStart : proposedStart.add(moment().utcOffset(), 'minutes')

    if (proposedStart < moment()) { // if we are starting in the past
      proposedStart = proposedStart.add(24, 'hours')
      project.start = proposedStart.toDate()
    }
    events.getEvents(project, oauth2Client, (error, calendarEvents) => {
      if (error) {
        console.error(error)
        callback(false)
      }
      var before = []
      const days = Math.floor((project.end - project.start) / ONE_DAY) + 2
      var length = project.hours / days
      // now will allocate a slot each day over the course of days days
      for (var i = 0; i < days; i++) {
        before.push(events.createAllocatedEvent(project.start, length, project.summary, i))
      }
      var allocatedEvents = []
      async.each(before, (event, done) => {
        var doesNotOverlap = true
        var attempts = 0

        async.whilst(() => doesNotOverlap, (finishedWithLoop) => {
          async.reduce(calendarEvents, true, (prev, cur, next) => {
            next(null, prev && events.doesNotOverlap(event, cur))
          }, (err, result) => {
            if (!result) { // if it overlaps with something
              event.start += FIFTEEN_MINUTES
              event.end += FIFTEEN_MINUTES
              attempts += 1
              if (attempts > 96) { callback('could not allocate') } // could not allocate before next day
            } else {
              doesNotOverlap = false
            }
            finishedWithLoop()
          }) // async.reduce
        }, () => { allocatedEvents.push(event); done() }) // async.whilst
      }, () => { callback(null, allocatedEvents) }) // async.each
    }) // events.getEvents
  }) // db.get
}

/**
 * Handles project posting description from the user and
 * allocates events on their calendar appropriately
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {Object} projectData description of project
 * @param {Object} res express.js response
 */
function postProject(oauth2Client, email, projectData, res) {
  var project = {}
  try {
    // want to start project at the next given preferred time

    const newSettings = {
      bestTime: projectData.bestTime,
      sleepTimes: [
        moment(projectData.sleepTime, 'hh:mm:ss').format('hhmm'),
        moment(projectData.wakeTime, 'hh:mm:ss').format('hhmm'),
      ]
    }
    db.put(email, newSettings, () => {
      const dummy = new Date()
      project = {
        start: new Date(dummy.getTime()),
        end: new Date(projectData.dueDate),
        summary: projectData.eventTitle,
        hours: projectData.estimatedHours
      }

      const errors = model.check(project)
      if (errors.length !== 0) {
        console.log(errors)
        res.status(400).send(errors)
      } else {
        divvy(project, email, oauth2Client, (divvyErr, allocatedEvents) => {
          if (divvyErr) {
            console.log(divvyErr)
            res.sendStatus(500)
          } else {
            async.each(allocatedEvents, (event, done) => {
              events.persistEvent(oauth2Client, event, (error) => {
                done(error)
              })
            }, (err) => {
              if (err) {
                console.log(err.stack)
                res.sendStatus(500)
              } else {
                res.sendStatus(201)
              } // checking for async.each errors
            }) // async.each
          } // checking for divvy errors
        }) // divvy
      } // checking for invalid proects
    }) // db.put for settings
  } catch (err) { // giant try/catch
    console.error(err)
    res.sendStatus(500)
  }
}

module.exports = postProject
