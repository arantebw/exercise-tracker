// /app.js

'use strict';

// models
const User = require('./models/user');
const Exercise = require('./models/exercise');

const bodyParser = require('body-parser');
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

let newUser, newExercise;

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

app.post('/api/exercise/add', (req, res, next) => {
    newExercise = new Exercise({
	"user": req.body.userId,
	"description": req.body.description,
	"duration": req.body.duration,
	"date": req.body.date
    });
    newExercise.save(err => {
	User.findById(req.body.userId).exec((err, user) => {
	    if (err) {
		throw new Error(err);
	    }
	    user.exercises.push(newExercise.id);
	    user.save();
	});
    });
    next();
}, (req, res) => {
    res.json({
	"username": "",
	"description": "",
	"duration": 0,
	"_id": "",
	"date": ""
    });
});

module.exports = app;
