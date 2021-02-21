'use strict';

const express = require('express');

const server = express();

const PORT = process.env.PORT || 4000; 

server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`)
})


server.get('/test',(request,response)=>{
    response.send('my server is working!!');
  })
  