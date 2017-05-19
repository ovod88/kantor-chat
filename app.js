var express = require('express');
var app = express();
var logger = require('./logger/log')(module);

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');
var session = require('express-session');

// var index = require('./routes/index');
// var users = require('./routes/users');

// // view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

// // uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if(app.get('env') == 'development') {//log request AT THE END OF REQUEST
  app.use(logger('dev'));//different log formats
} else {
  app.use(logger('default'));
}

app.use(bodyParser.json());//parse application/json body sent from form to req.body object
app.use(bodyParser.urlencoded({ extended: false }));//parse header parameters (for example GET) to req.query object
app.use(cookieParser());//parse cookies into req.cookies object if there are any
app.use(express.static(path.join(__dirname, 'public')));

var sessionStore = require('middleware/sessionStore');

app.use(session({//this creates collection called sessions to store user session
    "secret": config.get('session:secret'),
    "key": config.get('session:key'),
    "cookie": {
      "path": "/",
      "httpOnly": true,
      "maxAge": null
    },
    "store": sessionStore
}));


// app.use(function(req, resp, next) {
//   req.session.visits = req.session.visits + 1 || 1;
//   resp.send('Number of visits: '+ req.session.visits );
// });

app.use(require('middleware/sendHttpError'));//creates method to send beautiful http error method
app.use(require('middleware/loadUser'));
// app.get('/', function(req, resp) {
//   resp.render('index');
// });

require("routes")(app);

//Default route if express does not find route 
app.use(function(req, resp, next) {
  if(req.url == '/forbidden') {
    next(new Error('Forbidden url'));//If next is called with argument - express automatically detects an error 
    //in request processing and call default error handler which can be overwritten. Throw also is transfered to this function
  } else {
    next();//Normal situation
  }
});

app.use(function(req, resp) {//Default route handler
  resp.status(404).send('No page for the provided url');
});

var HttpError = require('errors').HttpError;
app.use(function(err, req, resp, next) {//Error handler is called then error is thrown or next() is called this parameter
  if(typeof err === 'number') {
    err = new HttpError(err);
  }

  if(err instanceof HttpError) {
    resp.sendHttpError(err);
  } else {
    if(app.get('env') == 'development') {//This parameter can be changed via NODE_ENV. By default development
      resp.status(500).send(err.stack);//Default express error handler
    } else {
      err = new HttpError(500);
      resp.sendHttpError(err);
    }
  }
});

module.exports = app;
