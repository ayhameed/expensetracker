require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
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

//login post method
app.post(
    "/",
    (req, res, next) => {
        passport.authenticate('local-login', { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(401).json({
                    message: "Failed to login",
                    token: null,
                });
            }
            req.login(user, { session: false }, (err) => {
                if (err) {
                    return next(err);
                }
                // login successful, generate JWT
                jwt.sign({ user: user }, process.env.SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Failed to login",
                            token: null,
                        });
                    }
                    // redirect to dashboard with JWT token
                    return res.redirect('/dashboard?token=' + token);
                });
            });
        })(req, res);
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

// app.listen
app.listen(process.env.PORT, () => {
    console.log('Server started on port 3000');
});
