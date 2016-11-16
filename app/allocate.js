/* eslint no-console:0 */
var model = require('../models/event')
var events = require('./events')
const ONE_DAY = 1000 * 60 * 60 * 24

/**
 * Format events based on given input
 * @param  {Date} start
 * @param  {Integer} length
 * @param  {Integer} daysAfter
 * @return {Object} event
 */
function createEvent(start, length, daysAfter) {
  return {
    start: start.getTime() + ONE_DAY * daysAfter,
    end: start.getTime() + ONE_DAY * daysAfter + length
  }
}

/**
 * Whether to events Overlap
 * @param  {Object} allocatedEvent
 * @param  {Object} calendarEvent
 * @return {boolean} result
 */
function doesOverlap(allocatedEvent, calendarEvent) {
  return false
}

/**
 * Actually divide up project into events based on a given email's calendar
 * Will call events.createEvent with each generated event
 * @param {Object} project A description of the overall event
 * @param {OAuth2} oauth2Client Authorized auth instance of google.auth.OAuth2
                                with which to make API call
 * @param {function} callback callback to be called when project is allocated
 */
function divvy(project, oauth2Client, callback) {
  events.getEvents(project, oauth2Client, (err, calendarEvents) => {
    if (err) {
      console.error(err)
      callback(false)
    }
    var allocatedEvents = []
    const days = Math.floor((project.end - project.start) / ONE_DAY) + 1
    var length = Math.floor(project.hours / days)
    // now will allocate a slot each day over the course of days days
    for (var i = 0; i < days; i++) {
      allocatedEvents.push(createEvent(project.start, length, i))
    }
    console.log(allocatedEvents)
    while (true) {
      // implement checking overlaps
      break;
    }

    callback(true)
  })
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
      divvy(project, oauth2Client, (result) => {
        res.sendStatus(result ? 201 : 500)
      })
    }
  } catch (err) {
    console.error(err.stack)
    res.status(500)
  }
}

module.exports = postProject
