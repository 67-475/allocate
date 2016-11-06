const settings = require('../../models/event')
var assert = require('chai').assert;

var buster = {}

describe('models/model.js', () => {

  before(() => {
    const today = new Date()
    buster = {
      start: new Date((today.getFullYear()) + 1),
      end: new Date((today.getFullYear()) + 2),
      summary: 'Download More RAM'
    }
  })

  it('should validate a correct model object')
  it('should not let you start an event in the past')
  it('should not let you start before you begin')
})
