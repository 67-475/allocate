class EventsArray extends Array {
  constructor(allReturnedResults) {
    super();

    for (var i = 0; i < allReturnedResults.length; i++) {
      allReturnedResults[i].start.dateTime = Date(Date.parse(allReturnedResults[0].start.dateTime))
      allReturnedResults[i].end.dateTime = Date(Date.parse(allReturnedResults[0].end.dateTime))
      this.push(allReturnedResults[i])
    };
  }

}

module.exports = EventsArray