<?php
// Load XML timetable
$timetable = simplexml_load_file('timetableP.xml');
if ($timetable === false) {
    die("Error: Cannot load timetable.xml");
}

// Get the current day and next 6 days
date_default_timezone_set('YOUR_TIMEZONE'); // Replace with your timezone
$today = date('l');

// Create an array to map PHP weekday to XML structure
$weekdays = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
$current_day_index = array_search($today, $weekdays);

// Output today's schedule
echo "<h2>Today's Schedule ({$today})</h2>";
if (isset($timetable->day[$current_day_index])) {
    $today_schedule = $timetable->day[$current_day_index];
    echo "<ul>";
    foreach ($today_schedule->event as $event) {
        echo "<li><strong>{$event->time}:</strong> {$event->activity}</li>";
    }
    echo "</ul>";
} else {
    echo "<p>No events for today.</p>";
}

// Output the schedule for the whole week in landscape layout
echo "<h2>Weekly Timetable</h2>";
echo "<div class='timetable-container'>";
foreach ($weekdays as $index => $weekday) {
    echo "<div class='day-column'>";
    echo "<h3>{$weekday}</h3>";
    if (isset($timetable->day[$index])) {
        $day_schedule = $timetable->day[$index];
        echo "<ul>";
        foreach ($day_schedule->event as $event) {
            echo "<li><strong>{$event->time}:</strong> {$event->activity}</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No events for {$weekday}.</p>";
    }
    echo "</div>";
}
echo "</div>";
?>



<!-- Style to improve readability and create a landscape layout -->
<style>
    body {
        font-family: Arial, sans-serif;
    }
    h2, h3 {
        color: #2c3e50;
    }
    ul {
        list-style-type: none;
        padding-left: 0;
    }
    li {
        background-color: #f4f4f4;
        margin-bottom: 5px;
        padding: 10px;
        border-radius: 5px;
    }
    .timetable-container {
        display: flex;
        gap: 20px;
        overflow-x: auto;
    }
    .day-column {
        flex: 1;
        min-width: 150px;
        background-color: #eef2f5;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
</style>
