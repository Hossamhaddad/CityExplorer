'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const server = express();

server.use(cors());

const PORT = process.env.PORT || 4000;

const pg=require('pg');

const superagent = require('superagent');

      const client = new pg.Client(process.env.DATA_BASE_URL);

// const client = new pg.Client({ connectionString: process.env.DATA_BASE_URL, ssl: { rejectUnauthorized: false } });

// server.listen(PORT, () => {
//   console.log(`listening on port ${PORT}`)
// })

server.get('/yelp',handleYelp)
server.get('/', handleHome)

function handleYelp(req,res){
let city=req.query.location
let key=process.env.YELP_KEY;
let page=req.query.page
let offset=((page -1) * 5 + 1)
let header=`{Authorization':'${key}'}`
let url=`https://api.yelp.com/v3/businesses/search?location=${city}&limit=5&offset=${offset}`
console.log(url);
superagent.get(url)
 .set(`Authorization`,`Bearer ${key}`)
.then(yelpData=>{
  let yelpinfo=yelpData.body.businesses.map(item=> new Yelp(item))
  console.log(yelpinfo);
 res.send(yelpinfo)
})

.catch(error=>{
  console.log(error);
})
}





function Yelp(data){
this.name=data.name
this.image_url=data.image_url
this.price=data.price
this.rating=data.rating
this.url=data.url
  // "name": "Pike Place Chowder",
  // "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
  // "price": "$$   ",
  // "rating": "4.5",
  // "url": "https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
}









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
  let SQL = `SELECT * FROM locations WHERE search_query='${city}';`;
  client.query(SQL)
  .then(results=>{
    if(results.rowCount!==0){
    console.log('fromDataBase')
    console.log(results.rows)
    res.send(results.rows)
    }
    else {
  
      const city = req.query.city;
        let key = process.env.LOCATION_KEY;
        let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        superagent.get(url)
          .then(locaDat => {
            const locationData = new Location(city, locaDat.body[0]);
            let SQL = `INSERT INTO locations VALUES ($1,$2,$3,$4) RETURNING *;`;
            let safeValues = [locationData.search_query,locationData.formatted_query,locationData.latitude,locationData.longitude];
            client.query(SQL,safeValues)
            .then(results=>{
              res.send(locationData);
              console.log(' from api ');
              console.log(results.rows);
            })
            
          })
}
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
    res.send(parksArr)
  })
}

function Parks(parksData,i){
  this.name=parksData.body.data[i].fullName
  this.address=parksData.body.data[i].map
  this.fee=parksData.body.data[i].entranceFees[0].cost
  this.description=parksData.body.data[i].description
  this.address=parksData.body.data[i].addresses[0].line1+parksData.body.data[i].addresses[0].stateCode+parksData.body.data[i].addresses[0].city+parksData.body.data[i].addresses[0].postalCode

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

server.get('/movies',hanldeMovie)
function hanldeMovie(req,res){
  const city=req.query.search_query;
  let key=process.env.MOVIES_KEY;
  let url=`https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${city}&page=1`
  console.log(url);
  superagent.get(url)
  .then(movieDat=>{
    let newArr=[];
    const moviesData=movieDat.body.results.forEach(item=>{
     newArr.push(new Movies(item))
     
    })
    res.json(newArr)
    })
}

function Movies(data){
this.title=data.title
this.overview=data.overview
this.average_votes=data.vote_average
this.total_votes=data.vote_count
this.img=`https://image.tmdb.org/t/p${data.poster_path}`
this.popularity=data.popularity
this.released_on=data.release_date
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
