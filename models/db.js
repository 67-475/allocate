var levelup = require('levelup')
var levelupDB = levelup('./db', { valueEncoding: 'json' })


module.exports = levelupDB
