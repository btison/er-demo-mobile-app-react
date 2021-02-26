'use strict'

const express = require("express");
const path = require("path");
const generatePassword = require('password-generator');


const app = express(); // create express app

app.set('port', process.env.PORT || 8080);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/passwords', (req, res) => {
    const count = 5;
  
    // Generate some passwords
    const passwords = Array.from(Array(count).keys()).map(i =>
      generatePassword(12, false)
    )
  
    // Return them as json
    res.json(passwords);
  
    console.log(`Sent ${count} passwords`);
  });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
  });

// start express server on port 8080
app.listen(app.get('port'), () => {
  console.log('server started on port '  + app.get('port'));
});