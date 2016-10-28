/* eslint no-console:0 */
var Validator = require('jsonschema').Validator;
var buster = new Validator()

var schema = {
  id: '/settings',
  type: 'object',
  properties: {
    bestTime: { type: 'string' },
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


/**
 * Validate given object against above schema
 * @param  {Object} obj a settings object in the following form:
 var example = {
   bestTime: "m",
   sleepTime: [0, 800]
 }
 * @return {Boolean} result Whether or not given object is valid
 */
function check(obj) {
  const result = buster.validate(obj, schema)
  result.errors.forEach((error) => { console.log(error) })
  return result.errors.length === 0
}

module.exports = check
