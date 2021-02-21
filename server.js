'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const server = express();

const PORT = process.env.PORT || 4000; 

server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`)
})


server.get('/test',(request,response)=>{
    response.send('my server is working!!');
  })

server.get('/location',(req,res)=>{
  const locData = require('./data/location.json');
  console.log(locData);
  console.log(locData[0]);
  const locationObj = new Location(locData);
    console.log(locData);
    console.log(locData[0]);
  console.log(locationObj)
  res.send(locationObj);
  
})


function Location(locationData){
  this.search_query = 'Lynnwood';
  this.formatted_query= locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}
