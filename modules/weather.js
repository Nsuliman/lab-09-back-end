'use strict';

const superagent = reqiure('superagent');

module.exports = getWeather;

function getWeather(location) {
    const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${location}`;
    return superagent.get(url)
        .then(data => parseWeather(data.body));
}; // End of getWeather function 

function parseWeather(data) {
    try {
        const weatherSummaries = data.daily.date.map(day => {
            return new Weather(day);
        });
        return Promise.resolve(weatherSummaries);
    } catch (e) {
        return Promise.reject(e);
    }
}; // End of parseWeather function 

function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toString().slice(0, 15);
} // End of Weather constructor function
