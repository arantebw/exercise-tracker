// /server.js

'use strict';

const app = require('./app');
require('dotenv').config();
const express = require('express');

app.listen(process.env.PORT, (req, res, next) => {
    next();
}, (req, res, next) => {
    console.log('app is running at http://localhost:' + process.env.PORT);
});
