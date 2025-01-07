 import { getTextColor } from "./js/utils.js";
 
 document.addEventListener('DOMContentLoaded', () => {
            // check if timetable.local.xml exists
            let fetchstring = 'timetable.local.xml';
            fetch('timetable.local.xml', { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    fetchstring = 'timetable.local.xml';
                }
            });

            fetch(fetchstring)
                .then(response => response.text())
                .then(xmlString => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlString, "application/xml");


                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const currentDay = days[(new Date().getDay() + 6) % 7];

                    function getDaySchedule(dayName) {
                        const dayNode = xmlDoc.querySelector(`day[name="${dayName}"]`);
                        if (!dayNode) return [];
                        return Array.from(dayNode.querySelectorAll('event')).map(eventNode => {
                            const startTime = eventNode.querySelector('startTime')?.textContent || "00:00";
                            const endTime = eventNode.querySelector('endTime')?.textContent || "01:00";
                            const backgroundColor = eventNode.querySelector('color')?.textContent || null;
                            const textColor = eventNode.querySelector('TColor')?.textContent || null;
                            return {
                                startTime,
                                endTime,
                                backgroundColor,
                                textColor,
                                activity: eventNode.querySelector('name')?.textContent || "(No activity)"
                            };
                        }).filter(event => /^\d{2}:\d{2}$/.test(event.startTime) && /^\d{2}:\d{2}$/.test(event.endTime));
                    }

                    const app = Vue.createApp({
                        data() {
                            return {
                                currentDay: currentDay,
                                selectedDay: currentDay,

                                days: days,

                                weeklySchedule: {
                                    Monday: getDaySchedule('Monday'),
                                    Tuesday: getDaySchedule('Tuesday'),
                                    Wednesday: getDaySchedule('Wednesday'),
                                    Thursday: getDaySchedule('Thursday'),
                                    Friday: getDaySchedule('Friday'),
                                    Saturday: getDaySchedule('Saturday'),
                                    Sunday: getDaySchedule('Sunday')
                                },
                                timeCellHeight: 40 // Standard height for one hour
                            };
                        },
                        computed: {
   
                            todaySchedule() {
                                return this.weeklySchedule[this.currentDay] || [];
                            },
                            // get the current day name
          
                            displayedHours() {

                                // Extract all start and end times from the weekly schedule
                                const allTimes = Object.values(this.weeklySchedule).flatMap(day => day.flatMap(event => [event.startTime, event.endTime]));
                                
                                // Determine the minimum and maximum hours from the extracted times
                                const minHour = Math.min(...allTimes.map(t => parseInt(t.split(':')[0])));
                                const maxHour = Math.max(...allTimes.map(t => parseInt(t.split(':')[0])));
                                
                                // Generate an array of hours from minHour to maxHour, formatted as "HH:00"
                                return Array.from({ length: (maxHour - minHour + 1) }, (_, i) => `${(minHour + i).toString().padStart(2, '0')}:00`);
                            },
                            // displayed hours for the current day
                            displayedHoursCurrentDay() {
                                const allTimes = this.weeklySchedule[this.selectedDay].flatMap(event => [event.startTime, event.endTime]);
                                const minHour = Math.min(...allTimes.map(t => parseInt(t.split(':')[0])));
                                const maxHour = Math.max(...allTimes.map(t => parseInt(t.split(':')[0])));
                                return Array.from({ length: (maxHour - minHour + 1) }, (_, i) => `${(minHour + i).toString().padStart(2, '0')}:00`);
                            }
                
                        },
                        methods: {
                                                     // is ritaday
                            isRitaDay(day) {
      
                            
                                // check if the passed day has the attribute "rita" set to true
                                return xmlDoc.querySelector(`day[name="${day}"]`).getAttribute('rita') === 'true';
                                    
                            },
                            isToday(day) {
                                return currentDay === day;
                            },
                            createTimeSlots(day, singleDay = false) {
                        
                                let schedule = this.weeklySchedule[day] || [];
                                
                                const constSchedule = schedule;
                                const slots = [];
                                
                                let hours = this.displayedHours.map(h => parseInt(h.split(':')[0]));
                                if(singleDay){
                                    hours = this.displayedHoursCurrentDay.map(h => parseInt(h.split(':')[0]));
                                }



                                let currentIndex = 0;
                                for (const hour of hours) {
                              
                                    // Find the event that matches the current hour
                                    const matchingEvent = schedule.find(event => {
                                        const start = parseInt(event.startTime.split(':')[0]);
                                        const end = parseInt(event.endTime.split(':')[0]);
                                        // this test if <= ???

                                        return hour >= start && hour <= end;
                                    });
                                    schedule = schedule.filter(event => event !== matchingEvent);
                                    
            
                                
                                    if (matchingEvent) { 
                                        // Add an empty slot to the beginning of the hour if the event doesn't start at the beginning of the hour or to the end of the previous event
                                        const [eventStartHour, eventStartMinutes] = matchingEvent.startTime.split(':').map(Number);
                                        const [eventEndHour, eventEndMinutes] = matchingEvent.endTime.split(':').map(Number);
                                        const eventStartTime = eventStartMinutes / 60;
                                        if (eventStartTime > 0) {

                                            // find an event that is earlier in the scehdule but ends at the same hour as the current event starts
                                            const previousEvent = constSchedule.filter(event => {
                                                const [endH, endM] = event.endTime.split(':').map(Number);
                                                return endH === eventStartHour && endM <= eventStartMinutes; // This is the bug
                                            }).pop();
                                
                                            // ---------------------- EMPTY SLOT ----------------------
                                            if (!previousEvent) {
                                                // if there is no previous event in the same hour add an empty slot from the beginning of the hour to the start of the event
                                                slots.push({ isEmpty: true, startTime: `${hour.toString().padStart(2, '0')}:00`, endTime: matchingEvent.startTime });
                                            }else{

                                                // if there is a previous event in the same hour add an empty slot from the end of the previous event to the start of the event
                                                if(previousEvent.endTime != matchingEvent.startTime)
                                                {
                                                    slots.push({ isEmpty: true, startTime: previousEvent.endTime, endTime: `${eventStartHour.toString().padStart(2, '0')}:${eventStartMinutes.toString().padStart(2, '0')}` });
                                                    console.log('empty from', previousEvent.endTime, `${eventStartHour.toString().padStart(2, '0')}:${eventStartMinutes.toString().padStart(2, '0')}`);
                                                    console.log('matching event', matchingEvent);
                                                    console.log('previous event', previousEvent);
                                                }
                                                
                                                
                                            }

                                        }
                                        


                                        if (currentIndex === 0 || slots[currentIndex - 1]?.activity !== matchingEvent.activity) {
                                            slots.push({
                                                ...matchingEvent,
                                                duration: (parseInt(matchingEvent.endTime.split(':')[0]) - parseInt(matchingEvent.startTime.split(':')[0]))
                                                    + (parseInt(matchingEvent.endTime.split(':')[1]) - parseInt(matchingEvent.startTime.split(':')[1])) / 60,
                                                isEmpty: false
                                            });
                                        }
                                        if(eventEndMinutes != 0){
                        
                                            //add empty slot for the remaining time if there is no next event in the same hour
                                            const nextEvent = schedule.find(event => {
                                                const nextStartHour = parseInt(event.startTime.split(':')[0]);
                                                return nextStartHour === parseInt(matchingEvent.endTime.split(':')[0]);
                                            });
                                            
                                            if(!nextEvent){
                                                slots.push({ isEmpty: true, startTime: matchingEvent.endTime, endTime: `${(eventEndHour+1).toString().padStart(2, '0')}:00` });
                                            }
                                             
                                        }

                                      
                            
                                        

                                    } else {
                                        const previousEvent = schedule.find(event => {
                                            const [endH, endM] = event.endTime.split(':').map(Number);
                                          
                                            return endH === hour && endM != 0;
                                        });
                                        // also if there is a next event
                                        const nextEvent = schedule.find(event => {
                                            const nextStartHour = parseInt(event.startTime.split(':')[0]);
                                            return nextStartHour === hour + 1 && parseInt(event.startTime.split(':')[1]) != 0;
                                        });
                                        const machingEventFullSchedule = constSchedule.find(event => {
                                            const start = parseInt(event.startTime.split(':')[0]);
                                            const end = parseInt(event.endTime.split(':')[0]);
                                            const endMinutesNotZero = parseInt(event.endTime.split(':')[1]) != 0;
                                            return (hour >= start && hour <= end && endMinutesNotZero) || (hour >= start && hour < end);
                                        });

                            
                                        if(!previousEvent && !nextEvent && !machingEventFullSchedule)
                                            {
                                                slots.push({ isEmpty: true, startTime: `${hour.toString().padStart(2, '0')}:00`, endTime: `${(hour + 1).toString().padStart(2, '0')}:00` });
                                            }

                                    }
                                    currentIndex++;
                                }
                        
                        
                                console.log(slots);
                                return slots;
                            },
                            getActiveHourStyle(hour) {
                                
                                if (parseInt(hour.split(':')[0]) === new Date().getHours()) {
                                    return {
                                        color: 'red'
                                    };
                                }
                            },
                            changeCurrentDay(up, reset = false) {
                                if(!reset)
                                    this.selectedDay = days[(days.indexOf(this.selectedDay) + (up ? 1 : -1) + days.length) % days.length];
                                else
                                    this.selectedDay = currentDay;
                            },

                            getEventBlockStyle(slot, day) {

                                // if (slot.isEmpty) return { height: `${this.timeCellHeight}px` };


                                const startMinutes = parseInt(slot.startTime.split(':')[1]);
                                const endMinutes = parseInt(slot.endTime.split(':')[1]);
                                const startHour = parseInt(slot.startTime.split(':')[0]);
                                const endHour = parseInt(slot.endTime.split(':')[0]);
                                const duration = (endHour - startHour) + (endMinutes - startMinutes) / 60;
                                let returnValue =  {
                                    height: `${duration * this.timeCellHeight}px`,

                        
                                    // marginTop: `${(startMinutes / 60) * this.timeCellHeight}px`
                                };
                                if (slot.backgroundColor) {
                                    returnValue.backgroundColor = slot.backgroundColor;
                                    if (getTextColor(slot.backgroundColor)) {
                                        returnValue.color = getTextColor(slot.backgroundColor);
                                    }
                                }
                                if(slot.textColor){
                                    returnValue.color = slot.textColor;
                                } 
                                // if(day && slot.isEmpty && this.isRitaDay(day)){
                                   
                                //     returnValue.backgroundColor = '#7cf9e9';
                                //     // returnValue.color = 'black';
                                // }
                                
                                

                                return returnValue;
                            }
                        }
                    });

                    app.mount('#app');
                })
                .catch(error => {
                    console.error('Error loading XML:', error);
                });
        });