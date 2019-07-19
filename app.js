// /app.js

'use strict';
const bodyParser = require('body-parser');
// models
const User = require('./models/user');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const express = require('express');

// init app
const app = express();

// middlewares

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({ optionSuccess: 200 }));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(
    () => {
	console.log('database connection established');
    },
    err => {
	console.log(err);
	res.json({ "error": err });
    }
);

// routes

app.get('/', (req, res, next) => {
    next();
}, (req, res) => {
    res.send('app is now up and running');
});

let newUser;
app.post('/api/exercise/new-user', (req, res, next) => {
    newUser = new User({
	"username": req.body.username
    });
    newUser.save();
    next();
}, (req, res) => {
    res.json({
	"username": newUser.username,
	"_id": newUser.id
    });
});

module.exports = app;
