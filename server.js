'use strict';
console.log('server.js is running');

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const { response } = require('express');

const PORT = process.env.PORT;

app.use(cors());
app.listen(PORT, () => console.log(`Server is listening on Port: ${PORT}`));

app.get('/', (req,res) => {
    res.send(`Connected on Port: ${PORT}`);
});

function Location(searchedCity, display_name, latitude, longitude) {
    this.searchedCity = searchedCity;
    this.formatted_query = display_name;
    this.latitude = parseFloat(latitude);
    this.longitude = parseFloat(longitude);
}

function Weather(weather,valid_date) {
    this.weather = weather;
    this.valid_date = valid_date;
}

app.get('/location', (req,res) => {
    const dataArrayFromJson = require('./data/location.json');
    const dataObjectFromJson = dataArrayFromJson[0];

    const searchedCity = req.query.city;
    const newLocation = new Location(searchedCity,dataObjectFromJson.display_name,dataObjectFromJson.lat,dataObjectFromJson.lon);

    res.send(newLocation);
});

app.get('/weather', (req,res) => {
    const dataArrayFromJson = require('./data/weather.json');
    const weatherArray = [];
    dataArrayFromJson.data.map( day => {
        weatherArray.push(new Weather(day.weather.description,day.valid_date))
    });
    res.send(weatherArray);
});

app.use('*', (req,res) => {
    res.status(500).send('Status: 500<br> Server has error processing query.');
});
//app now deployed on heroku

// .catch(error => {
//     res.status(500).send('location query failed');
// });