var TimeSlot = require('./time-slot.js')

class TimeSlotsArray extends Array {
  constructor(startDate, endDate) {
    super();
    
    const FIFTEEN_MINUTES = 900000 // in milliseconds

    // Round to nearest 15 minutes
    startDate.setMinutes(startDate.getMinutes() + (15 - (startDate.getMinutes() % 15)))
    startDate.setSeconds(0)
    startDate.setMilliseconds(0)
    endDate.setMinutes(endDate.getMinutes() - (endDate.getMinutes() % 15))

    this.numberOfSlots = (endDate.getTime()-startDate.getTime()) / FIFTEEN_MINUTES

    for (var i = 0; i < this.numberOfSlots; i++) {
      var slot = new TimeSlot(new Date(startDate.getTime()+(i*FIFTEEN_MINUTES)), 
        new Date(startDate.getTime()+((i+1)*FIFTEEN_MINUTES)))
      this.push(slot)
    };
  }

  blockOutTimesFromExistingCalendarEvents(eventsArray) {
    
  }

  markSleepTime(preferences) {
    
  }

  markPreferredTimes(preferences) {

  }
}

module.exports = TimeSlotsArray