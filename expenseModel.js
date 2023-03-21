const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// define expense schema
const expenseSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }

});

const expense = mongoose.model('expense', expenseSchema);
module.exports = expense;