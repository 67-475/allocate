$(function() {
  if (typeof settings !== 'undefined') {
      var bestTime = settings.bestTime
      var sleepTime = settings.sleepTimes[0]
      var wakeTime = settings.sleepTimes[1]

      while(sleepTime.length < 4) {
        sleepTime = '0' + sleepTime
      }
      while(wakeTime.length < 4) {
        wakeTime = '0' + wakeTime
      }

      // format best time form
      $("#workTimePreference").val(bestTime)

      // format sleep time form
      var formattedSleepTime = sleepTime.substr(0, 2) + ":" + sleepTime.substr(2) + ":00"
      $("#sleepTime").val(formattedSleepTime)

      // format wake time form
      var formattedWakeTime = wakeTime.substr(0, 2) + ":" + wakeTime.substr(2) + ":00"
      $("#wakeTime").val(formattedWakeTime)
  } else {
    console.log('undefined settings')
  }
})

var submitForm = function() {
  var bestTime = $("#workTimePreference").val()
  var sleepTime = $("#sleepTime").val()
  var wakeTime = $("#wakeTime").val()

  // format sleep time
  var formattedSleepTime = sleepTime.replace(":", "").substr(0, 4)
  console.log(formattedSleepTime)

  // format wake time
  var formattedWakeTime = wakeTime.replace(":", "").substr(0, 4)
  console.log(formattedWakeTime)

  var data = {
    bestTime: bestTime,
    sleepTimes: [parseInt(formattedSleepTime), parseInt(formattedWakeTime)]
  }

  $.ajax({
    url: "/settings",
    method: 'POST',
    data: data,
    success: function(data) {
      console.log(data)
    },
    error: function(err) {
      console.log(err)
    }
  })
}
