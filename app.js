// jshint esversion:6
const express = require('express');
const ejs = require('ejs');
const crypto = require('crypto');
const bodyparser = require('body-parser')
//load lodash
var _ = require('lodash');

const ENCRYPTION_KEY = '7@3dBa#@!091WXL.7@3dBa#@!211WXL.'; // Replace with your own key
const IV_LENGTH = 16; // For AES, this is always 16

const app = express();

// connect to mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/expenseDB').then(() => console.log('Connected to MongoDB')).catch(err => console.error('Error connecting to MongoDB:', err));

// set view engine
app.set('view engine', 'ejs');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// encrypt password
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

//decrypt password
function decrypt(text) {
    const [ivString, encryptedString] = text.split(':');
    const iv = Buffer.from(ivString, 'hex');
    const encrypted = Buffer.from(encryptedString, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const usersSchema = new mongoose.Schema({
    email: String,
    password: String
});

const users = mongoose.model('users', usersSchema);

// handle database connection errors
mongoose.connection.on('error', err => {
    console.error('Error connecting to MongoDB:', err);
});

// login route
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //convert email to lower case
    const lowercaseEmail = _.toLower(email);

    //retrieve user from db
    try {
        const user = await users.findOne({ email: lowercaseEmail }).exec();
        if (!user) {
            console.log('User not found');
            res.redirect('/');
            return;
        }
        // fetch password from db and map to variable
        const encryptedPassword = user.password

        // decrypt password for comparison
        const decryptedPassword = decrypt(encryptedPassword)

        if (password == decryptedPassword) {
            res.redirect('/dashboard');
        } else {
            res.redirect('/');
            console.log('Incorrect password');
        }
    } catch (err) {
        console.error('Error finding user:', err);
        res.status(500).send('Internal server error');
    }
});

// signup route
app.get('/signup', (req, res) => {
    res.render('signup');
});

// signup post method
app.post('/signup', async (req, res) => {
    const email = _.toLower(req.body.email); //convert email to lower case
    const password = req.body.password;

    try {
        const user = await users.create({
            email: email,
            password: encrypt(password)
        });
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Internal server error');
    }
});

// dashboard route
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// app.listen
app.listen(3000, () => { console.log('Server started on port 3000') });