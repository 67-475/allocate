function addEventToPage(ev) {
    var tbody = $("#tbody")
    console.log(ev.summary)

    var container = $('<tr></tr>')

    // summary
    container.append("<td>" + ev.summary + "</td>")

    // start/end
    if (ev.start.date != null) {
        container.append("<td>" + new Date(ev.start.date) + "</td")
        container.append("<td>" + new Date(ev.end.date) + "</td")
    } else if (ev.start.dateTime != null) {
        container.append("<td>" + new Date(ev.start.dateTime) + "</td")
        container.append("<td>" + new Date(ev.end.dateTime) + "</td")
    } else {
        container.append("<td>" + "Unknown" + "</td")
        container.append("<td>" + "Unknown" + "</td")
    }

    // location
    if (ev.location != null) {
        container.append("<td>" + ev.location + "</td")
    } else {
        container.append("<td>" + "Unknown" + "</td")
    }

    // reminders
    if (ev.reminders.overrides != null) {
        container.append("<td>" + ev.reminders.overrides.length + "</td")
    } else {
        container.append("<td>" + "None" + "</td")
    }

    tbody.append(container)
}

function inputUserDefaultSettings(settings) {
    var bestTime = settings.bestTime
    var sleepTime = settings.sleepTime[0]
    var wakeTime = settings.sleepTime[1]

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
}

function fetchUserDefaultSettings() {
    $.ajax({
        url: "/settings/" + email,
        type: "GET",
        success: function(data) {
            inputUserDefaultSettings(data)
        },
        error: function(err) {
            console.log(err)
        }
    })
}

function submitTaskForm() {
    var eventTitle = $("#eventTitle").val()
    var estimatedHours = $("#estimatedHours").val()
    var dueDate = $("#dueDate").val()
    var bestTime = $("#workTimePreference").val()
    var sleepTime = $("#sleepTime").val()
    var wakeTime = $("#wakeTime").val()

    var data = {
        eventTitle: eventTitle,
        estimatedHours: estimatedHours,
        dueDate: dueDate,
        bestTime: bestTime,
        sleepTime: sleepTime,
        wakeTime: wakeTime
    }

    console.log(data)

    // $.ajax({
    //     url: '/allocate',
    //     type: 'POST',
    //     data: data,
    //     success: function(data) {
    //         console.log(data)
    //     },
    //     error: function(data) {
    //         console.log(data)
    //     }
    // })

}

$(function() {
    if (typeof(events) !== "string") {
        for (var i = 0; i < events.length; i++) {
            var ev = events[i]
            addEventToPage(ev)
        };
    }

    fetchUserDefaultSettings()
})