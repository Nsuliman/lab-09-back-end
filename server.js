'use strict';


/******** dependencies *****/
require('dotenv').config();

const express = require('express');

const cors = require('cors');

const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

const server = express();

server.use( cors() );

const pg = require('pg');           /// for SQL Library

const client = new pg.Client(process.env.DATABASE_URL);          // to use database you created  

client.on('error', err => console.error(err));                  // to check if there's any error

/***************************************************** Functions ***************************************/
server.get('/location', locationHandler);
server.get('/weather', weatherHandler);
server.get('/events', eventHandler);


/*
Object should look like this:
{
  "search_query": "seattle",
  "formatted_query": "Seattle, WA, USA",
  "latitude": "47.606210",
  "longitude": "-122.332071"
}
 */

function locationHandler(request,response) {
  // getLocation(request.query.data)             // Get city input from user
  //   .then( locationData => response.status(200).json(locationData) );            // To show up the generated data 
  const city = request.query.data;
  console.log('cityyyyyyyyyyyyyyyyyyyyyyyyyyyyy : ', city);
  getLocation(city)
    // .then(locationData => res.status(200).json(locationData));
    .then(data =>  response.status(200).json(data))
    .catch((error) => errorHandler(error, request, response));

} // End of location handler function 


function getLocation(city) {
 
  // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`

  // return superagent.get(url)
  //   .then( data => {
  //     // console.log('\n\n\n\n\n\n\n\n data : ', data.header);
  //     // console.log('data.body : ', data.body);
  //     return new Location(city, data.body);
  //   })

  let SQL = 'select * FROM locations WHERE search_query = $1 ';
  let values = [city];

  console.log('  \n\n\n SQQQQQQQQQQQQQQQQQQQQQQQQQQL :', SQL);
console.log('  \n\n\n valuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuues :  ', values);

  return client.query(SQL, values)        // I stock here , didn't enter to promise 
    .then(results => {
      console.log(' \n\n\n resulttttttttttttttttttttttttttttttttttttts :  ', results);
      if (results.rowCount) { return results.rows[0]; }
      else {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`;
        // let SQL = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *';
          console.log('  \n\n\n urlllllllllllllllllllllllllllll :  ', url);
        return superagent.get(url)
          .then(data => cacheLocation(city, data.body));
      }
      // return new Location (city , data.body)
    });

};// End of get location function 

let cache = {};
function cacheLocation(city, data) {
  const location = new Location(data.results[0]);
  let SQL = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *';
  console.log('  \n\n\n SQQQQQQQQQQQQQQQQQQQQQQQQQQL  CacheLocation:', SQL);

  let values = [city, location.formatted_query, location.latitude, location.longitude];
  console.log('  \n\n\n valuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuues CacheLocation :  ', values);

  return client.query(SQL, values)
    .then(results => {
      const savedLocation = results.rows[0];
      cache[city] = savedLocation;
      return savedLocation;
    });
}; // End of cache location 


function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng;

} // End of location constructor function 

/****************************************************** WEATHER ************************************************/ 


function weatherHandler(request,response) {
  getWeather(request.query.data)
    .then( weatherData => response.status(200).json(weatherData) );

} // End of weather handler function 

function getWeather(query) {
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${query.latitude},${query.longitude}`;
  // console.log('url  : ', url );

  return superagent.get(url)
    .then( data => {
      const weather = data.body;
      return weather.daily.data.map( (day) => {
        return new Weather(day);
      });
    });
}// End of get weather function 

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1022.1).toDateString();
} // End of weather constructor function 

// When an error happens ...
const errorobject = {status : 500 ,  responseText : 'Sorry, something went wrong'};
server.use('*', (request, response) =>{
  response.status(404).send(Object.entries(errorobject));
});

/************************************** EventFul **********************************************/

function eventHandler(request,response) {
  getEvent(request.query.data)
    .then( eventData => response.status(200).json(eventData) );

} // End of event handler function 

function getEvent(query) {
  const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&location=${query.formatted_query}`;
    // console.log('url eventttttttttttttttttttttttttttttttttttttttttttt : \n\n\n\n\n\n', url );

    // console.log('querrrrrrrrrrrrry : \n\n\n\n\n\n ', query );
    // console.log('super agent urllllllllllll' ,superagent.get(url));

    return superagent.get(url)
    .then( data => {   
      // console.log('data 2 : ', data );   
      const eventful = JSON.parse(data.text);
      // console.log('eventful ', eventful);
      return eventful.events.event.map( (eventday) => {
        // console.log('eventday : ', eventday);
        return new Eventful(eventday);
      });
    });
}// End of get eventful function 

function Eventful(eventday) {

  this.link = eventday.url;
  this.name = eventday.title;
  this.event_date = eventday.start_time;
  this.summary = eventday.description;

} // End of Eventful constructor function 


// client.connect();
// .then( () => {
//         server.listen(PORT, () => console.log(`App listening on ${PORT}`));        // to make the server listen after connected to database
//     });

server.listen( PORT, () => console.log('hello world, from port', PORT));