var levelup = require('levelup')
var levelupDB = levelup('./db', { valueEncoding: 'json' })
const settings = require('./settings')

function get(email, callback) {
  levelupDB.get(email, (err, result) => { callback(err, results) })
}

function put(email, userSettings, callback) {
  if(settings.check(userSettings)) {
    levelupDB.put(email, userSettings, (err) => { callback(err) })
  } else {
    callback(403)
  }
}

module.exports = {
  get: get,
  put: put
}
