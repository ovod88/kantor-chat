var express = require('express');
var app = express();
var logger = require('logger/log')(module);


// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');

// var index = require('./routes/index');
// var users = require('./routes/users');

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));


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

app.use(function(err, req, resp, next) {//Error handler

  if(app.get('env') == 'development') {//This parameter can be changed via NODE_ENV. By default development
    resp.status(500).send(err.stack);//Default express error handler
  } else {
    resp.status(500).send('Error occured');
  }
});

// app.use('/', index);
// app.use('/users', users);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
