class TimeSlot {
  constructor(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.free = true;
    this.preferred = false;
    this.sleepTime = false;
  }
}

module.exports = TimeSlot