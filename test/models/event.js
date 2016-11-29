const event = require('../../models/event')
var assert = require('chai').assert;

var buster = {}
const today = new Date()

describe('models/event.js', () => {

  before(() => {
    buster = {
      start: new Date('' + (today.getFullYear()) + 1),
      end: new Date('' + (today.getFullYear()) + 2),
      summary: 'Download More RAM',
      calendar: 'things I may or may not do'
    }
  })

  it('should validate a correct model object', () => {
    assert.equal(event.check(buster).length, 0)
  })

  it('should not let you start before you begin', () => {
    buster.start = new Date('' + (today.getFullYear()) + 3)
    assert.equal(event.check(buster).length, 1)
  })
})
