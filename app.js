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
mongoose.connect('mongodb://localhost:27017/expenseDB').then(() => console.log('connected to db'));

// set view engine
app.set('view engine', 'ejs');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(express.json())

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
            return;
        }
        if (user) {

            // fetch password from db and map tp variable
            console.log("encrypted passowrd",user.password)
            encryptedPassword = user.password

            // decrypt password for comparisom
            const decryptedPassword = decrypt(encryptedPassword)
            console.log("decrypted  passowrd",decryptedPassword)
            if (password == decryptedPassword) {
                res.redirect('/dashboard');
            } else {
                res.redirect('/');
                console.log('Incorrect password');
            }
        }
    } catch (err) {
        console.log('Error finding user:', err);
    }
});

// signup route
app.get('/signup', (req, res) => {
    res.render('signup');
})

// signup post method
app.post('/signup', (req, res) => {
    const email = req.body.email

    //convert email to lower case
    _.toLower(email)
    
    const password = req.body.password
    console.log("Password:", password);

    const encryptedPassword = encrypt(password);
   
    // map variables to user schema
    const user = new users({
        email: email,
        password: encryptedPassword

    });

    // save user to db
    user.save()
    res.redirect('/dashboard')
});

// dashboard route
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// app.listen
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
