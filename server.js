'use strict';

require('dotenv').config();

const express = require('express');

const cors = require('cors');

const PORT = process.env.PORT || 3000;

const server = express();

server.use(cors());


/******************************** modules links *************************************/
const client = require('./modules/client.js');
const location = require('./modules/location.js');
const weather = require('./modules/weather.js');
const events = require('./modules/events.js');
const yelp = require('./modules/yelp.js');
const movies = require('./modules/movies.js');

/******************************** handlers functions *************************************/
server.get('/location', locationHandler);
server.get('/weather', weatherHanddler);
server.get('/events', eventHanddler); 
server.get('/yelp', yelpHandler);
server.get('/movies', moviesHandler);


function locationHandler(request, response) {
  const city = request.query.data;
  console.log('city', city);
  location.getlocation(city)
    .then(data => sendJson(data, response))
    .catch((error) => errorHandler(error, request, Response));
}; // end of location handler 


function weatherHanddler(request, response) {
  const location = request.query.data;
  weather(location)
    .then(summaries => sendJson(summaries, response))
    .catch((error) => errorHandler(error, request, Response));
  }; // end of weather handler 


  function eventHanddler(request, response) {
  const location = request.query.data;
  events(location)
    .then(eventslist => sendJson(eventslist, response))
    .catch((error) => errorHandler(error, request, Response));
  }; // end of events handler 

function yelpHandler(request, response) {
  const location = request.query.data;
  yelp(location)
    .then(reviews => sendJson(reviews, response))
    .catch((error) => errorHandler(error, request, Response));
  }; // end of yelp handler 

function moviesHandler(request, response) {
  const location = request.query.data;
  movies(location)
    .then(list => sendJson(list, response))
    .catch((error) => errorHandler(error, request, Response));
  }; // end of movies handler 


  function sendJson(data, Response) {
  Response.status(200).json(data);
}; // end of sendJson function


/********** Error 1 **********/
function notFoundHandler(request, response) {
  response.status(404).send('?????????');
};

/********** Error 2 **********/
function errorHandler(error, req, Response) {
  Response.status(500).send(error);
};


/******** Server Listen *******/
client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`App listening on ${PORT}`))
  })
  .catch(err => console.error(err));
