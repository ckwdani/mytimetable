# Week Plan tool
Welcome to my repeating Week plan tool
Just want some good tool to have an overview of my repeating week Structure.

## Filling the XML
The timetable is defined in an XML file. Each day of the week is represented by a `<day>` element, and each event within a day is represented by an `<event>` element. Below is the structure of the XML file:

```xml
<timetable>
    <day name="DayName"> <!-- Eg Thuesday, Monday, etc ... (must be in english) -->
        <event>
            <startTime>HH:MM</startTime>
            <endTime>HH:MM</endTime>
            <name>Event Name</name>
            <color>#RRGGBB</color> <!-- Optional: Background color for the event -->
            <TColor>#RRGGBB</TColor> <!-- Optional: Text color for the event -->
        </event>
        <!-- Add more <event> elements as needed -->
    </day>
    <!-- Add more <day> elements for other days of the week -->
</timetable>
```

### Special days
Also if you have special days in a Week (or if you like only take your adderal/ritalin once or twice a week) you can add the _rita_ flag to a day:

``` xml
...
    <day name="Thuesday" rita='true'>
        ...
    </day>
...
```

This will change the background color of the empty spaces of the day.
And also of the heading part of the day name, and the times in the single day view!