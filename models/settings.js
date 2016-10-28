/* eslint no-console:0 */
var Validator = require('jsonschema').Validator;
var buster = new Validator()

var schema = {
  id: '/settings',
  type: 'object',
  properties: {
    bestTime: {
      type: 'string',
      pattern: '^[man]{1}$',
    },
    sleepTime: {
      type: 'array',
      items: {
        type: 'number',
        minimum: 0,
        maximum: 2400
      }
    }
  }
}
buster.addSchema(schema, '/settings')

/* an example settings object would take the following form
  {
    bestTime: "m",
    sleepTime: [0, 800]
  }
 */


/**
 * Validate given object against above schema, which requires this basic form:
 *
 * bestTime: either m or a or n (morning, afternoon, or night)
 *
 * sleepTime: an array of 2 numbers in military time
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
