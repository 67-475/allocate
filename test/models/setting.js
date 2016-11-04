const settings = require('../../models/setting')
var assert = require('chai').assert;

var morningPerson = {}
var nightOwl = {}

describe('models/settings.js', () => {
  before(() => {
    morningPerson = {
      bestTime: 'm',
      sleepTimes: [2200, 600]
    }

    nightOwl = {
      bestTime: 'n',
      sleepTimes: [200, 1000]
    }
  })

  it('should validate a correct settings object', () => {
    assert.equal(settings.check(morningPerson).length, 0)
    assert.equal(settings.check(nightOwl).length, 0)
  })

  it('should only allow the correct bestTime attributes', () => {
    nightOwl.bestTime = 'time to get a watch'
    assert.equal(settings.check(nightOwl).length, 1)

    nightOwl.bestTime = 'man'
    assert.equal(settings.check(nightOwl).length, 1)

    nightOwl.bestTime = 'morning'
    assert.equal(settings.check(nightOwl).length, 1)

    nightOwl.bestTime = 'n'
    assert.equal(settings.check(nightOwl).length, 0)
  })

  it('should only allow the correct time of day', () => {
    morningPerson.sleepTimes = [-10, 1200]
    assert.equal(settings.check(morningPerson).length, 1)

    morningPerson.sleepTimes = [-10, 9732]
    assert.equal(settings.check(morningPerson).length, 1)
  })

  it('should not allow incorrect ordering of time of day')
})
