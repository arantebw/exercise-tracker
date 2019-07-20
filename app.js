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

app.get('/', (req, res) => {
    res.send('app is now up and running');
});

let newUser;
app.post('/api/exercise/new-user', (req, res) => {
    newUser = new User({
	"username": req.body.username
    });
    newUser.save();
    res.json({
	"username": newUser.username,
	"_id": newUser.id
    });
});

let newExercise;
app.post('/api/exercise/add', (req, res) => {
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
	    user.exercises.push(newExercise);
	    user.save();
	});
    });
    res.json({
	"username": newExercise.user,
	"description": newExercise.description,
	"duration": newExercise.duration,
	"_id": newExercise.user,
	"date": newExercise.date
    });
});

app.get('/api/exercise/log', (req, res, next) => {
    User.findById(req.query.userId).exec((err, user) => {
	if (err) {
	    throw new Error(err);
	}

	res.json({
	    "_id": user.id,
	    "username": user.username,
	    "count": user.exercises.length
	});
    });
});

module.exports = app;
