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
    console.log(preferences)
  }

  markPreferredTimes(preferences) {

  }
}

module.exports = TimeSlotsArray