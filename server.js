'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const server = express();

server.use(cors());

const PORT = process.env.PORT || 4000;

const pg=require('pg');

const superagent = require('superagent');

const client = new pg.Client(process.env.DATABASE_URL);

// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

// server.listen(PORT, () => {
//   console.log(`listening on port ${PORT}`)
// })


server.get('/', handleHome)


function handleHome(req, res) {
  res.send('this is home route ');
}


server.get('/test', handleTest)

function handleTest(request, response) {
  response.send('my server is working!!');
}




server.get('/location', handleLocation)


//https://us1.locationiq.com/v1/search.php?key=YOUR_ACCESS_TOKEN&q=SEARCH_STRING&format=json
function handleLocation(req, res) {
  
  const city = req.query.city;
  let key = process.env.LOCATION_KEY;
  let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  superagent.get(url)
    .then(locaDat => {
      const locationData = new Location(city, locaDat.body[0]);
      // console.log(locationData)
      res.send(locationData);
    })
}




server.get('/weather', handleWeather)

//https://api.weatherbit.io/v2.0/forecast/daily?city=Raleigh,NC&key=API_KEY
function handleWeather(req, res) {
  const city = req.query.search_query;
  let key = process.env.WEATHER_KEY;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;

  // console.log(url)

  superagent.get(url)
    .then(weatherDat => {

      let weatherArr = weatherDat.body.data.map(function (n, i) {
        return new Weather(weatherDat, i);
      })
      res.send(weatherArr)

    })

}


server.get('/parks', handlePark)

function handlePark(req, res) {
  const city = req.query.search_query;
  let key = process.env.PARK_KEY;
  let url = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${key}`;
  superagent.get(url)
  .then(parksDat =>{

    let parksArr = parksDat.body.data.map(function (n, i) {
      return new Parks(parksDat, i);
      
  })
  console.log(parksArr)
  res.send(parksArr)
})
}

function Parks(parksData,i){
 this.name=parksData.body.data[i].fullName
 this.address=parksData.body.data[i].map
 this.fee=parksData.body.data[i].entranceFees[0].cost
 this.description=parksData.body.data[i].description
//  this.address=parksData.body.data[i].addresses[0]
 this.address=parksData.body.data[i].addresses[0].line1+parksData.body.data[i].addresses[0].stateCode+parksData.body.data[i].addresses[0].city+parksData.body.data[i].addresses[0].postalCode

 // "name": "Mount Rainier National Park",
  //    "address": ""55210 238th Avenue East" "Ashford" "WA" "98304",
  //    "fee": "0.00"
  //    "description": "Ascending to 14,410 feet above sea level, Mount Rainier stands as an icon in the Washington landscape. An active volcano, Mount Rainier is the most glaciated peak in the contiguous U.S.A., spawning five major rivers. Subalpine wildflower meadows ring the icy volcano while ancient forest cloaks Mount Rainier’s lower slopes. Wildlife abounds in the park’s ecosystems. A lifetime of discovery awaits.",
  //    "url"
}






function Weather(weatherData, i) {
  this.forecast = weatherData.body.data[i].weather.description;
  this.time = weatherData.body.data[i].valid_date;
}



function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}

server.use('*', handleError)
function handleError(req, res) {
  const error = new Error()
  res.status(500).send(error)
}

function Error() {
  this.status = 500;
  this.responseText = 'Sorry, something went wrong'
}

client.connect()
.then(()=>{
  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
  })

});
