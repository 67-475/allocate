var assert = require('chai').assert;
const scrambler = require('../auth/scrambler')
const words = require('random-words')

describe('auth/scrambler.js', () => {
  it('should correctly encrypt and decrypt words', () => {
    const buster = words({ exactly: 5, join: '-' })
    const secret = scrambler.encrypt(buster)

    assert.isTrue(buster == scrambler.decrypt(secret))
  })

  it('should not have the same encryption across instances', () => {
    const scrambler2 = require('../auth/scrambler')
    const buster = words({ exactly: 5, join: '-' })

    assert.equal(scrambler.encrypt(buster), scrambler2.encrypt(buster))
  })
})
