require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var passport = require('passport')
var logger = require('morgan');
const sequelize = require('./sequelize');
require('./passport');


// Definimos los archivos de las rutas
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit:'50mb', parameterLimit: 1000000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Use JSON parser
app.use(bodyParser.json({limit:'50mb'}));

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
