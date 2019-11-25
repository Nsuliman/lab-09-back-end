'use strict';

const superagent = require('superagent');

module.exports = getEvents;

function getEvents(location) {
    const url = `http://api.eventful.con/json/events/search?location=${location}&data=Future`;
    return superagent.get(url)
    .then( data => parseEventsData( JSON.parse(data.text) ))
    .catch(err => console.error(err) );
}; // End of get events function 

function parseEventsData(data) {
    try {
        const events = data.events.event.map(eventData => {
            const event = new Event(eventData);
            return event;
        });
        return Promise.resolve(events);
    } catch(e) {
        return Promise.reject(e);
    }
}; // End of parseEventsData function 


function Event(event) {
    this.link = event.url;
    this.name = event.title;
    this.event_date = event.start_time;
    this.summary = event.description;
} // End of events constructor function 