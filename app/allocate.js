/* eslint no-console:0, block-scoped-var:0, no-loop-func:0, no-param-reassign:0 */
var model = require('../models/event')
var events = require('./events')
var async = require('async')
const ONE_DAY = 1000 * 60 * 60 * 24
const FIFTEEN_MINUTES = 1000 * 60 * 15

/**
 * Actually divide up project into events based on a given email's calendar
 * Will call events.createEvent with each generated event
 * @param {Object} project A description of the overall event
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {function} callback callback to be called when project is allocated
 */
function divvy(project, oauth2Client, callback) {
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
}

/**
 * Handles project posting description from the user and
 * allocates events on their calendar appropriately
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {Object} projectData description of project
 * @param {Object} res express.js response
 */
function postProject(email, oauth2Client, projectData, res) {
  var project = {}
  try {
    // want to start project at the next given preferred time

    const dummy = new Date()
    project = {
      start: new Date(dummy.getTime()),
      end: new Date(projectData.dueDate),
      summary: projectData.eventTitle,
      hours: projectData.estimatedHours,
      calendar: projectData.calendar
    }

    const errors = model.check(project)
    if (errors.length !== 0) {
      console.log(errors)
      res.status(400).send(errors)
    } else {
      divvy(project, oauth2Client, (divvyErr, allocatedEvents) => {
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
            }
          }, (err) => {
            if (err) {
              console.log(err.stack)
              res.sendStatus(500)
            } else {
              res.status(201).send(allocatedEvents)
            }
          })
        }
      })
    }
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
}

module.exports = postProject
