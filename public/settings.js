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
    var formattedSleepTime = sleepTime.substr(0, 2) + ":" + sleepTime.substr(2)
    $("#sleepTime").val(formattedSleepTime)

    // format wake time form
    var formattedWakeTime = wakeTime.substr(0, 2) + ":" + wakeTime.substr(2)
    $("#wakeTime").val(formattedWakeTime)
  } else {
    console.log('undefined settings')
  }
})

var submitForm = function() {
  postStatus.className = 'fa fa-spin fa-refresh fa-3x fa-fw'
  var bestTime = $("#workTimePreference").val()
  var sleepTime = $("#sleepTime").val()
  var wakeTime = $("#wakeTime").val()

  // format sleep time
  var formattedSleepTime = sleepTime.replace(":", "").substr(0, 4)

  // format wake time
  var formattedWakeTime = wakeTime.replace(":", "").substr(0, 4)

  var data = {
    bestTime: bestTime,
    sleepTimes: [parseInt(formattedSleepTime), parseInt(formattedWakeTime)]
  }

  $.ajax({
    url: "/settings",
    method: 'POST',
    data: data,
    success: function(data) {
      postStatus.className = 'fa fa-check'
    },
    error: function(err) {
      console.log(err)
      postStatus.className = 'fa fa-times'
    }
  })
}
