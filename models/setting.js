/* eslint no-console:0 */
var jsonschema = require('jsonschema')
var Validator = jsonschema.Validator

var schema = {
  id: '/settings',
  type: 'object',
  properties: {
    bestTime: {
      type: 'string',
      pattern: '^[maen]{1}$',
    },
    sleepTimes: {
      type: 'array',
      format: 'sequentialTime',
      items: {
        type: 'number',
        minimum: 0,
        maximum: 2400
      }
    }
  }
}

/**
 * Here we assume that people do not go to sleep before 8pm or after 8am
 * which is a relatively arbitrary measure, but (at least to me) seems pretty
 * reasonable
 * @param  {Array} input array of sleep Times
 * @return {Boolean} result result of validation
 */
Validator.prototype.customFormats.sequentialTime = (input) => {
  if(input.length !== 2) {
    return input + ' should be an array of length 2'
  }

  var input_t = [input[0], input[1]]
  input_t[1] += input[1] < 800 ? 2400 : 0


  if(input_t[0] >= input_t[1]) {
    return input + ' should be sequential military times'
  }

  return true
}

var buster = new Validator()
buster.addSchema(schema, '/settings')

/**
 * Validate given object against above schema, which requires this basic form:
 * bestTime: either m or a or n (morning, afternoon, or night)
 * sleepTime: an array of 2 numbers in military time
 *
 * @param  {Object} obj a settings object
 * @return {Boolean} results Errors generated in validating the object
 */
 exports.check = (obj) => {
  const result = buster.validate(obj, schema)
  result.errors.forEach((error) => {
    if(process.env.NODE_ENV == 'test') {
      console.log(error)
    }
  })
  return result.errors
}
