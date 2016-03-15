var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');

var database = require('./database');
var routes = require('./routes/index');
var users = require('./routes/users');
var songs = require('./routes/songs');
var signup = require('./routes/signup');
var login = require('./routes/login');
var authentication = require('./services/authentication');

var app = express();

var sess = {
 secret: 'social-music-api',
 cookie: {},
 resave: false,
 saveUninitialized: true
};

//session
app.use(session(sess));

//passport
passport.serializeUser(function(user, done) {
 done(null, user);
});

passport.deserializeUser(function(obj, done) {
 done(null, obj);
});

passport.use(authentication.songApiLocalStrategy());
app.use(passport.initialize());
app.use(passport.session());

var verifyAuth = function(req, res, next) {
  res.locals.user_session = false;
  res.locals.user_admin = false;
  res.locals.currentUser = false;
  if (req.originalUrl === '/signup' || req.originalUrl === '/login') {
    return next();
  }
  if (req.isAuthenticated()) {
    res.locals.user_session = true;
    res.locals.user_admin = (req.user.username === 'admin');
    res.locals.currentUser = req.user;
    return next();
  }
  if (req.accepts('text/html')) {
    return res.redirect('/login');
  }
  if (req.accepts('application/json')) {
    res.set('Location', '/login');
    return res.status(401).send({err: 'User should be logged'});
  }

};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', verifyAuth);

app.use('/', routes);
app.use('/users', users);
app.use('/songs', songs);
app.use('/signup', signup);
app.use('/login', login);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});



module.exports = app;
