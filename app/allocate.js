/* eslint no-console:0 */
var model = require('../models/event')
// var events = require('./events')

/**
 * Actually divide up project into events based on a given email's calendar
 * Will call events.createEvent with each generated event
 * @param {Object} project A description of the overall event
 * @param {string} email string with which
 * @param {function} callback callback to be called when project is allocated
 */
function divvy(project, oauth2Client, callback) {
  console.log(project, oauth2Client)

  // eventually this will be evaluation of the allocation process
  // TODO: actually implement the allocation
  const result = true

  callback(result)
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
      summary: projectData.eventTitle
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
