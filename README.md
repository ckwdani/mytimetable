# Week Plan tool
Welcome to my repeating Week plan tool
Just want some good tool to have an overview of my repeating week Structure.

## Filling the XML
The timetable is defined in an XML file. Each day of the week is represented by a `<day>` element, and each event within a day is represented by an `<event>` element. Below is the structure of the XML file:

```xml
<timetable>
    <day name="DayName">
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
