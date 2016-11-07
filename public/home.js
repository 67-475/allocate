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
    var formattedSleepTime = sleepTime.substr(0, 2) + ":" + sleepTime.substr(2) + ":00"
    $("#sleepTime").val(formattedSleepTime)

    // format wake time form
    var formattedWakeTime = wakeTime.substr(0, 2) + ":" + wakeTime.substr(2) + ":00"
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

function showFormExtras() {
    $("#formExtras").show()
}

function toggleFormExtras() {
    var extras = $("#formExtras")
    var eventTitle = $("#eventTitle").val()

    if (eventTitle === "") {
        extras.hide()
    }
}

$(function() {
    fetchUserDefaultSettings()
})
