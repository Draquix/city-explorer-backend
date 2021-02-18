'use strict';
console.log('server.js is running');

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const { response } = require('express');
const pg = require('pg');

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);


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

function Park(name,address,fee,description,url) {
    this.name = name;
    this.address = address;
    this.fee = fee;
    this.descripton = description;
    this.url = url;
}

app.get('/location', (req,res) => {
    console.log('running location route');
    
     //const dataArrayFromJson = require('./data/location.json');
     //const dataObjectFromJson = dataArrayFromJson[0];

     const apiKey = process.env.GEOCODE_API_KEY;
     const searchedCity = req.query.city;
    
     const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${searchedCity}&format=json`;
    const sqlQuery = 'SELECT * FROM location WHERE search_query=$1';
    const sqlArray = [searchedCity];
   
    client.query(sqlQuery, sqlArray).then(result => {
        if(result.rows.length !== 0){
            res.send(result.rows[0]);
        }


        superagent.get(url).then(apiReturned => {
            const newLocation = new Location(searchedCity,'apiReturned.body.formatted_query',apiReturned.body.lat,apiReturned.body.lon);
            res.status(200).send(newLocation);

            const sqlQuery = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)';
            const sqlArray = [newLocation.searchedCity, newLocation.formatted_query, newLocation.latitude, newLocation.longitude];
            client.query(sqlQuery, sqlArray);
       // })
        }).catch(error => {
            res.status(500).send('There was an error in the location query');
    })
});

app.get('/weather', (req,res) => {
    // const dataArrayFromJson = require('./data/weather.json');
    const lat = parseFloat(req.query.latitude);
    const lon = parseFloat(req.query.longitude);
    const searchedCity = req.query.city;
    const apiKey = process.env.WEATHER_API_KEY;
    const url = `http://api.weatherbit.io/v2.0/forecast/daily`;
    const searchParameters = {
        key:apiKey, city:searchedCity, days:8
    };

    const weatherArray = [];
    superagent.get(url).query(searchParameters).then(returnData => {
        returnData.body.data.map( day => {
            weatherArray.push(new Weather(day.weather.description,day.valid_date));
        })
        res.status(200).send(weatherArray);
    }).catch(error => {
        res.status(500).send('There was an error in the weather query');
    })
    // dataArrayFromJson.data.map( day => {
    //     weatherArray.push(new Weather(day.weather.description,day.valid_date))
    // });
});

app.get('/parks', (req,res) => {
    const apiKey = process.env.PARKS_API_KEY;
    const url = 'https://developer.nps.gov/api/v1/parks'
    const state = req.query.state;
    const searchParameters = {
        api_key:apiKey, stateCode:'ia', limit:5
    }
    const parksArray = [];
    //res.send(state);
    superagent.get(url).query(searchParameters).then(returnData => {
        returnData.body.data.map( park => {
            parksArray.push(new Park(park.fullname,park.addresses.line1,park.entranceFees.cost,park.description,park.directionsUrl));
        })
        res.status(200).send(parksArray);
    }).catch(error => {
        res.status(500).send('There was an error in the parks query');
    })
});

app.use('*', (req,res) => {
    res.status(500).send('Status: 500<br> Server has error processing query.');
});
//app now deployed on heroku

// .catch(error => {
//     res.status(500).send('location query failed');
// });