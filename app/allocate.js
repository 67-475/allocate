/* eslint no-console:0, block-scoped-var:0, no-loop-func:0 */
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
    if (err) {
      console.error(err)
      callback(false)
    }
    var allocatedEvents = []
    const days = Math.floor((project.end - project.start) / ONE_DAY) + 2
    var length = Math.floor(project.hours / days)
    // now will allocate a slot each day over the course of days days
    for (var i = 0; i < days; i++) {
      allocatedEvents.push(events.createAllocatedEvent(project.start, length, project.summary, i))
    }
    for (var i = 0; i < allocatedEvents.length; i++) {
      var overlaps = true
      var attempts = 0
      while (overlaps) {
        async.reduce(calendarEvents, true, (prev, cur, next) => {
          next(null, prev && events.doesOverlap(allocatedEvents[i], cur))
        }, (err, result) => {
          overlaps = result
          if (overlaps) {
            allocatedEvents[i].start += FIFTEEN_MINUTES
            allocatedEvents[i].end += FIFTEEN_MINUTES
            attempts += 1
            // if we cannot put it here, should reallocate event with one fewer day
            if(attempts > (ONE_DAY - length) /  FIFTEEN_MINUTES) { callback([]) }
          }
        }) // async.reduce
      } // while loop
    } // for loop
    callback(allocatedEvents)
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
function postProject(oauth2Client, projectData, res) {
  var project = {}
  try {
    // want to start project at the next given preferred time

    project = {
      start: new Date(new Date().getTime() + 5000), // start 5 seconds from now
      end: new Date(projectData.dueDate),
      summary: projectData.eventTitle,
      hours: projectData.estimatedHours
    }

    const errors = model.check(project)
    if (errors.length !== 0) {
      res.status(400).send(errors)
    } else {
      divvy(project, oauth2Client, (allocatedEvents) => {
        const result = allocatedEvents.length > 0
        console.log(allocatedEvents)
        res.sendStatus(result ? 201 : 500)
      })
    }
  } catch (err) {
    console.error(err.stack)
    res.status(500)
  }
}

module.exports = postProject
