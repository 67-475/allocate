var TimeSlot = require('./time-slot.js')
const FIFTEEN_MINUTES = 900000 // in milliseconds

class TimeSlotsArray extends Array {
  constructor(startDate, endDate) {
    super();

    // Round to nearest 15 minutes
    startDate.setMinutes(startDate.getMinutes() + (15 - (startDate.getMinutes() % 15)))
    startDate.setSeconds(0)
    startDate.setMilliseconds(0)
    endDate.setMinutes(endDate.getMinutes() - (endDate.getMinutes() % 15))

    this.startDate = startDate
    this.endDate = endDate
    this.numberOfSlots = (endDate.getTime()-startDate.getTime()) / FIFTEEN_MINUTES

    for (var i = 0; i < this.numberOfSlots; i++) {
      var slot = new TimeSlot(new Date(startDate.getTime()+(i*FIFTEEN_MINUTES)), 
        new Date(startDate.getTime()+((i+1)*FIFTEEN_MINUTES)))
      this.push(slot)
    };
  }

  blockOutTimesFromExistingCalendarEvents(eventsArray) {
    for (var i = 0; i < eventsArray.length; i++) {
      var eventStart = new Date(Date.parse(eventsArray[i].start.dateTime))
      var eventEnd = new Date(Date.parse(eventsArray[i].end.dateTime))
      var slotStartIndex = (eventStart.getTime()-this.startDate.getTime()) / FIFTEEN_MINUTES
      var slotLength = (eventEnd.getTime()-eventStart.getTime()) / FIFTEEN_MINUTES
      for (var j = 0; j < slotLength; j++) {
        this[slotStartIndex+j].free = false;
      };
    };
  }

  markSleepTime(preferences) {
    var startString = preferences.sleepTimes[0]
    var endString = preferences.sleepTimes[1]

    while (startString.length < 4) {
      startString = '0' + startString
    }
    while (endString.length < 4) {
      endString = '0' + endString
    }

    var sleepStart = new Date()
    sleepStart.setTime(0)
    sleepStart.setHours(startString.slice(0,1))
    sleepStart.setMinutes(startString.slice(2,3))

    var sleepEnd = new Date()
    sleepEnd.setTime(0)
    sleepEnd.setHours(endString.slice(0,1))
    sleepEnd.setMinutes(endString.slice(2,3))
    if (sleepEnd < sleepStart) {
      sleepEnd.setDate(sleepEnd.getDate() + 1)
    }

    for (var i = 0; i < this.length; i++) {
      if (this[i].startTime.getHours() > sleepStart.getHours() &&
        this[i].startTime.getMinutes() > sleepStart.getMinutes() &&
        this[i].endTime.getHours() < sleepEnd.getHours() &&
        this[i].endTime.getMinutes() < sleepEnd.getMinutes()) {
        this[i].sleepTime = true
      }
    };
  }

  markPreferredTimes(preferences) {
    // later
  }

  getStartTimes(estimatedHours) {
    var hourBeginningSlots = new Array()
    var startTimes = new Array()
    for (var i = 0; i < this.length-3; i++) {
      if (this[i].free && !this[i].sleepTime &&
        this[i+1].free && !this[i+1].sleepTime &&
        this[i+2].free && !this[i+2].sleepTime &&
        this[i+3].free && !this[i+3].sleepTime) {
        hourBeginningSlots.push(this[i])
      }
    };
    var interval = Math.floor(hourBeginningSlots.length/Math.ceil(estimatedHours))
    for (var i = 0; i < Math.ceil(estimatedHours); i++) {
      startTimes.push(hourBeginningSlots[i*interval].startTime)
    };
    return startTimes
  }
}

module.exports = TimeSlotsArray