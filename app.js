var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const signup = require('./routes/signup');
const login = require('./routes/login');
const route = require('./routes');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'job-listing-frontend/dist')));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Request-Method","POST GET PUT PATCH DELETE");
    next();
});

app.use('/api', route);
app.use('/auth/login', login);
app.use('/auth/signup', signup);

//Serving Front End
app.get('*', (req, res) => {
    params = req.params;
    splitparams = params[0].split('/');
    try {
        if(splitparams['1'] === 'assets')
            res.sendFile(path.join(__dirname, 'public'+params['0']));
        else
            res.sendFile(path.join(__dirname, 'public/index.html'));
    }catch (e){
        console.log(e);
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
