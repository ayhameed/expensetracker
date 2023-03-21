const express = require('express');
const ejs = require('ejs');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const cors = require('cors');

const db = require('./db');
const users = require('./userModel');
const expense = require('./expenseModel');

const app = express();
const port = process.env.PORT || 3000;

// connect to mongodb
db.connect();

// set view engine
app.set('view engine', 'ejs');

// middlewares
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// passport config
require('./passportConfig')(passport);

// to protect route
function authMiddleware(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }
        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }
        req.user = user;
        next();
    })(req, res, next);
}

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
                });
            }
            req.login(user, { session: false }, (err) => {
                if (err) {
                    return next(err);
                }
                return res.json({ 
                    userObj: user,
                    message: "Login Successful" 
                })
            });
        })(req, res);
    }
);

// signup route
app.get('/signup', (req, res) => {
    res.render('signup');
});

//signup post method
app.post(
    '/signup',
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            // check if user exists
            const userExists = await users.findOne({ "email": email });
            if (userExists) {
                return res.status(401).json({
                    message: "User with email already exists",
                });
            }
            // Create a new user with the user data provided
            const user = await users.create({ email, password });

            return res.status(200).json({
                userObj: user,
                message: "Signup successful",
            });
        } catch (error) {
            next(error);
        }
    }
);

app.get('/dashboard', (req, res) => {
    res.render('dashboard')
})
// Dashboard route

// add expense route
app.post('/add-expense', async (req, res) => {
    try {
        const { title, amount } = req.body;
        const user = req.user;
        const expense = await users.addExpense(user._id, title, amount);
        return res.status(200).json(expense);
    } catch (error) {
        return res.status(500).json({
            message: 'Error adding expense'
        });
    }
});


// logout route 
app.get('/logout', function (req, res) {
    req.logout();
    res.sendStatus({ message: 'Successfully logged out.' });

});

// app.listen
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
