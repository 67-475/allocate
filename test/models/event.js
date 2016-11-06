const event = require('../../models/event')
var assert = require('chai').assert;

var buster = {}
const today = new Date()

describe('models/model.js', () => {

  before(() => {
    buster = {
      start: new Date('' + (today.getFullYear()) + 1),
      end: new Date('' + (today.getFullYear()) + 2),
      summary: 'Download More RAM',
    }
  })

  it('should validate a correct model object', () => {
    assert.isTrue(event.check(buster).length == 0)
  })
  it('should not let you start an event in the past', () => {
    buster.start = new Date('' + (today.getFullYear()) - 1),
    assert.isTrue(event.check(buster).length == 1)
  })
  it('should not let you start before you begin')
})
