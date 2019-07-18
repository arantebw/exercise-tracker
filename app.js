// /app.js

'use strict';
require('dotenv').config();
const cors = require('cors');
const express = require('express');

// init app
const app = express();

// middlewares

app.use(cors({ optionSuccess: 200 }));

// routes

app.get('/', (req, res, next) => {
    next();
}, (req, res) => {
    res.send('app is now up and running');
});

module.exports = app;
