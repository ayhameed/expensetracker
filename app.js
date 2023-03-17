// jshint esversion:6
const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const bcrypt = require('bcrypt');

const app = express();

// connect to mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/expenseDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error(err);
});

// set view engine
app.set('view engine', 'ejs');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: '74e67da5e0240014f284e225d471526748ebce5367efcf9888925f47c2c9b99e',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// passport local strategy
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
      const user = await User.findOne({ email });
      if (!user) {
          return done(null, false, { message: 'Incorrect email or password.' });
      }

      const isValidPassword = await user.isValidPassword(password);
      if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect email or password.' });
      }

      return done(null, user);
  } catch (err) {
      return done(err);
  }
}));

// passport session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
      const user = await User.findById(id);
      done(null, user);
  } catch (err) {
      done(err);
  }
});

// login route
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
  failureFlash: true
}));

// signup route
app.get('/signup', (req, res) => {
  res.render('signup');
});

// signup post method
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = new User({ email, password });
      await user.save();
      res.redirect('/login');
    } catch (error) {
      console.log(error);
      res.redirect('/signup');
    }
  });
  
// dashboard route
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// app.listen
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
