// Dependencies
const express   = require('express');
const morgan    = require('morgan');
const config    = require('./config');
const path      = require('path');

// Create new express instance
var app = express();

// adding Logger middleware
app.use(morgan('dev'));

// specify static files
app.use(express.static(path.join(__dirname, 'public')));

// Run server
app.listen(config.port, (err) => {
  if (err) {
    console.log("Whoops something went horribly wrong", err);
  } else {
    console.log("Listenning on port :", 3000);
  }
});
