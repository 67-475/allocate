// adapted from:
// http://lollyrock.com/articles/nodejs-encryption/

var crypto = require('crypto')
var words = require('random-words')

const algorithm = 'aes-256-ctr'
const password = words({ exactly: 5, join: '-' })

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password)
  var encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var deciphered = decipher.update(text, 'hex', 'utf8')
  deciphered += decipher.final('utf8');
  return deciphered;
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}
