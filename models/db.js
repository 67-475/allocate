var levelup = require('levelup')
var levelupDB = levelup('./db', { valueEncoding: 'json' })
const settings = require('./settings')

function get(email, callback) {
  levelupDB.get(email, (err, result) => { callback(err, results) })
}

function put(email, userSettings, callback) {
  const errors = settings.check(userSettings)
  if(errors.length == 0) {
    levelupDB.put(email, userSettings, (err) => { callback(err) })
  } else {
    callback(errors)
  }
}

module.exports = {
  get: get,
  put: put
}
