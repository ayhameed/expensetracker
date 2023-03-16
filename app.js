//    jshint esversion:6
const express = require('express')

/* eslint-disable no-unused-vars */
const ejs = require('ejs')

//load lodash
var _ = require('lodash');

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(express.json())

const posts = []

//root route method , rendering posts[] on home page
app.get('/', (req, res) => {
  res.render('login')
})







// app .listen
app.listen(3000, () => {
  console.log('Server started on port 3000')
})