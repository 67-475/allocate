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

$(function() {
    console.log(events)
    for (var i = 0; i < events.length; i++) {
        var ev = events[i]
        addEventToPage(ev)
    };
})
