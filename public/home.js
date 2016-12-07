/* eslint no-undef: 0, no-unused-vars:0, no-console:0 */
function inputUserDefaultSettings(settings) {
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
    var formattedSleepTime = sleepTime.substr(0, 2) + ":" +
    sleepTime.substr(2) + ":00"

    $("#sleepTime").val(formattedSleepTime)

    // format wake time form
    var formattedWakeTime = wakeTime.substr(0, 2) + ":" +
    wakeTime.substr(2) + ":00"

    $("#wakeTime").val(formattedWakeTime)

    // format due date default to tomorrow
    var tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
    var tomday = tomorrow.getDate();
    var tommonth = tomorrow.getMonth() + 1;
    var tomyear = tomorrow.getFullYear();
    if (tomday < 10) {
        tomday='0'+tomday
    }
    if (tommonth < 10) {
        tommonth='0'+tommonth
    }
    tomorrow = tomyear + "-" + tommonth + "-" + tomday + "T12:00:00"
    $("#dueDate").attr("value", tomorrow)
}

function fetchUserDefaultSettings() {
  $.ajax({
    url: '/settings/' + email,
    type: 'GET',
    success: (data) => {
      inputUserDefaultSettings(data)
    },
    error: (err) => {
      console.log(err)
    }
  })
}

function submitTaskForm() {
  postStatus.className = 'fa fa-spin fa-refresh fa-3x fa-fw'
  var eventTitle = $('#eventTitle').val()
  var estimatedHours = $('#estimatedHours').val()
  var dueDate = $('#dueDate').val()
  var bestTime = $('#workTimePreference').val()
  var sleepTime = $('#sleepTime').val()
  var wakeTime = $('#wakeTime').val()
  var calendar = $('#calendar').val()

  var data = {
    eventTitle: eventTitle,
    estimatedHours: estimatedHours,
    dueDate: dueDate,
    bestTime: bestTime,
    sleepTime: sleepTime,
    wakeTime: wakeTime,
    calendar: calendar
  }

  $.ajax({
      url: '/allocate',
      type: 'POST',
      data: data,
      success: function(data) {
          console.log(data)
          postStatus.className = 'fa fa-check'
          showProposalScreen(data)
      },
      error: function(data) {
          console.log(data)
          postStatus.className = 'fa fa-times'
      }
  })
}

function showProposalScreen(data) {
  $("#proposalModal").on("show.bs.modal", function(e) {
      $(this).find('.modal-title').text("Proposed Schedule")
      var fcEvents = []
      for (var i = 0; i < data.length; i++) {
        fcEvents.push(convertToFCEvent(data[i]))
      }
      $("#calendar").fullCalendar({
        events: fcEvents
      })
      $("#calendar").fullCalendar('render')
  })
  $("#proposalModal").modal()
  $("#calendar").fullCalendar('render')
}

function convertToFCEvent(event) {
  return {
      title: event.summary,
      start: new Date(event.start),
      end: new Date(event.end)
  }
}

function showFormExtras() {
  $('#formExtras').show()
}

function toggleFormExtras() {
  var extras = $('#formExtras')
  var eventTitle = $('#eventTitle').val()

  if (eventTitle === '') {
    extras.hide()
  }
}

$(function() {
  fetchUserDefaultSettings()

  // format due date default to tomorrow
  var tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
  var tomday = tomorrow.getDate();
  var tommonth = tomorrow.getMonth() + 1;
  var tomyear = tomorrow.getFullYear();
  if (tomday < 10) {
    tomday = '0' + tomday
  }
  if (tommonth < 10) {
    tommonth = '0' + tommonth
  }
  tomorrow = tomyear + '-' + tommonth + '-' + tomday + 'T12:00:00'
  $('#dueDate').attr('value', tomorrow)
})

// Code for making iFrame
function addCalendarToPage(cal) {
  var tbody = $('#tbody')
  var container = $('<tr></tr>')

  container.append('<td>' + cal.id + '</td>')
  container.append('<td>' + cal.summary + '</td>')
  container.append('<td>' + cal.description + '</td>')
  container.append('<td>' + cal.backgroundColor + '</td>')
  container.append('<td>' + cal.foregroundColor + '</td>')

  tbody.append(container)
}

$(() => {
  var iFrameSourceString = 'https://calendar.google.com/calendar/embed?mode=WEEK&height=600&wkst=1&bgcolor=%23FFFFFF&'
  var colorsArray = ['A32929', 'B1365F', '7A367A', '5229A3', '29527A', '2952A3', '1B887A', '28754E', '0D7813', '528800', '88880E', 'AB8B00', 'AB8B00', 'B1440E', '865A5A', '705770', '4E5D6C', '5A6986', '4A716C', '6E6E41', '8D6F47', '853104', '691426', '5C1158', '23164E', '182C57', '060D5E', '125A12', '2F6213', '2F6309', '5F6B02', '875509', '8C500B', '754916', '6B3304', '5B123B', '42104A', '113F47', '333333', '0F4B38', '856508', '711616']
  var colorsArrayIndex = 0

  for (var i = 0; i < calendars.length; i++) {
    var cal = calendars[i]
    addCalendarToPage(cal)

    if (colorsArrayIndex >= colorsArray.length) {
      colorsArrayIndex = 0
    }

    iFrameSourceString = iFrameSourceString + '&src=' + encodeURIComponent(cal.id) + '&color=%23' + colorsArray[colorsArrayIndex]
    colorsArrayIndex++
  };
    var $iFrame = $("<iFrame>", {"id":"iFrame", "src": iFrameSourceString,
        "style": "border-width:0", "width": "100%", "height": "600px",
        "frameborder": "0", "scrolling": "no"})

  iFrameSourceString += '&ctz=America%2FNew_York'
  var $iFrame = $('<iFrame>', { src: iFrameSourceString, style: 'border-width:0', width: '100%', height: '600px', frameborder: '0', scrolling: 'no' })
  $('#iFrameDiv').append($iFrame)
})
