'use strict';

const superagent = require('superagent');

module.exports = getYelp;

function getYelp(location) {
    const url = `https://api.yelp.com/v3/businesses/search?location=${location}`;
    return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)         // security issue 
    .then( data => parseYelpData(data.body) );
}; // End of getYelp function 

function parseYelpData(data){
    try {
        const yelpSummaries = data.businesses.map( business => {
            return new Yelp(business);
        });
        return Promise.resolve(yelpSummaries);
    } catch(e) {
        return Promise.reject(e);
    }
}; // End of parseYelpData function 

function Yelp(business){
    this.tableName = 'yelps';
    this.name = business.name;
    this.image_url = business.image_url;
    this.price = business.price;
    this.rating = business.rating;
    this.url = business.url;
    this.created_at = Data.now();
} // End of Yelp constructor function 