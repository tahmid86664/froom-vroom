const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const multer =  require('multer');
const mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://tahmid:526628Tahmid@test1.mbzeo.mongodb.net/FroomVroom?retryWrites=true&w=majority");
const db = mongoose.connection;


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const categoriesRouter = require('./routes/categories');
const contactRouter = require('./routes/contact');
const aboutRouter = require('./routes/about');

const app = express();

// my models
const Category = require('./models/category');

app.locals.moment = require('moment'); // for global use

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// set a cookie
app.use(function (req, res, next) {
  // check if client sent cookie
  let cookie = req.cookies.visitor;
  if (cookie === undefined) {
    // no: set a new cookie
    let randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('visitor',randomNumber, { maxAge: 900000, httpOnly: true, path: "/"});
    
    console.log('cookie created successfully');
  } else {
    console.log('cookie exists', cookie);
  } 
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
  secret: 'tuples_are_great',
  saveUninitialized: true,
  resave: true
}))

// passport
app.use(passport.initialize());
app.use(passport.session());

// flash and messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
})

// for using db globally
app.use((req, res, next) => {
  req.db = db;  
  next();
})

// for global access to user
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

app.get('*', async (req, res, next) => {
  await Category.find({}, (err, result) => {
    if(err) throw err;
    res.locals.categories = result;
  });
  next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/categories', categoriesRouter);
app.use('/contact', contactRouter);
app.use('/about', aboutRouter);

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
