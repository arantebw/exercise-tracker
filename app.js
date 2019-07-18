// /app.js

'use strict';
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const express = require('express');

// init app
const app = express();

// middlewares

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

module.exports = app;
