//    jshint esversion:6
const express = require('express')

/* eslint-disable no-unused-vars */
const ejs = require('ejs')

//load lodash
var _ = require('lodash');

const app = express()

//connect to mongogb
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/expenseDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error(err);
});

// setup express-session
const session = require('express-session');

app.use(session({
  secret: '74e67da5e0240014f284e225d471526748ebce5367efcf9888925f47c2c9b99e',
  resave: false,
  saveUninitialized: true
}));
// set view engine
app.set('view engine', 'ejs')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(express.json())


//root/login route method , rendering posts[] on home page
app.get('/', (req, res) => {
  res.render('login')
})

//Signup route
app.get('/signup', (req, res) => {
  res.render('signup')
})

// app .listen
app.listen(3000, () => {
  console.log('Server started on port 3000')
})