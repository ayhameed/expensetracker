const express = require('express');
const ejs = require('ejs');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const bodyparser = require('body-parser');
const users = require('./userModel');
const _ = require('lodash');

const app = express();

// connect to mongodb
const db = require('./db');
db.connect();

// set view engine
app.set('view engine', 'ejs');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// passport config
require('./passportConfig')(passport);

// login route
app.get('/', (req, res) => {
  res.render('login');
});

app.post(
  '/',
  passport.authenticate('local-login', { session: false }),
  (req, res, next) => {
    res.redirect('/dashboard');
    // res.json({
    //   user: req.user,
    // });
  }
);

// signup route
app.get('/signup', (req, res) => {
  res.render('signup');
});

// signup post method
app.post(
  '/signup',
  passport.authenticate('local-signup', { session: false }),
  (req, res, next) => {
    res.redirect('/dashboard');
  }
);

// dashboard route
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// app.listen
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
