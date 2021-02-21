'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const server = express();

const PORT = process.env.PORT || 4000; 

server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`)
})


server.get('/',(req,res)=>{
  res.send('this is home route ');
})

server.get('/test',(request,response)=>{
    response.send('my server is working!!');
  })

server.get('/location',(req,res)=>{
  const locData = require('./data/location.json');
  const locationObj = new Location(locData);
  res.send(locationObj);
})




server.get('/weather',(req,res)=>{
  const wethData = require('./data/weather.json');
  //  const weatherObj= new Weather(wethData);


   let foreCast=[];
   for (var i=0;i<5;i++){
   let newforecast= new Weather(wethData,i);
   foreCast.push(newforecast);
    //  console.log(foreCast);
   }

  // console.log(wethData.data[0].weather.description);
  // console.log(wethData.data[0].valid_date);
  // const locationObj = new Location(wethData);
  // res.send(locationObj);
  res.send(foreCast);
})




function Weather(weatherData,index){
  this.forecast=weatherData.data[index].weather.description;
  this.time=weatherData.data[index].valid_date;
}



function Location(locationData){
  this.search_query = 'Lynnwood';
  this.formatted_query= locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}

server.use('*',(req,res)=>{
  const error= new Error()
  res.status(500).send(error)
})

function Error(){
  this.status=500;
  this.responseText='Sorry, something went wrong'
}