/* eslint no-console:0 */
var jsonschema = require('jsonschema')
var Validator = jsonschema.Validator

var schema = {
  id: '/settings',
  type: 'object',
  format: 'notBackwards',
  required: ['start', 'end', 'summary', 'calendar']
}

/**
 * You should not start an event before it begins
 * @param  {Array} input array of sleep Times
 * @return {Boolean} result result of validation
 */
Validator.prototype.customFormats.notBackwards = (input) => {
  try {
    const start = new Date(input.start)
    const end = new Date(input.end)

    // should not have times out of order
    if(start.getTime() >= end.getTime()) { return false }

  } catch (err) {
    console.error('Could not parse start and end times')
    return false
  }

  return true
}

var buster = new Validator()
buster.addSchema(schema, '/event')

/**
 * Validate given object against above schema, which requires this basic form:
 * bestTime: either m or a or n (morning, afternoon, or night)
 * sleepTime: an array of 2 numbers in military time
 *
 * @param  {Object} obj a settings object
 * @return {Boolean} results Errors generated in validating the object
 */
function check(obj) {
  const result = buster.validate(obj, schema)
  result.errors.forEach((error) => {
    if(process.env.NODE_ENV == 'test') {
      console.log(error)
    }
  })
  return result.errors
}

module.exports = {
  check
}
