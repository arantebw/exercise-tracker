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

// load static files
app.use(express.static(__dirname + '/views/'));

// middlewares

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({ optionSuccess: 200 }));

mongoose.connect(process.env.MONGODB_LOCAL, { useNewUrlParser: true }).then(
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
	"username": req.body.username,
	"exercises": []
    });
    newUser.save((err, user) => {
	if (err) {
	    throw new Error(err);
	}
	console.log('new user created');
    });
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
	"date": new Date(req.body.date)
    });
    newExercise.save((err, exercise) => {
	if (err) {
	    throw new Error(err);
	}
	console.log('new exercise created');
	User.findById(exercise.user.id).exec((err, user) => {
	    if (err) {
		throw new Error(err);
	    }
	    user.exercises.push(exercise);
	    user.save((err, user) => {
		if (err) {
		    throw new Error(err);
		}
		console.log('new exercise-to-user created');
	    });
	});
    });
    User.populate(newExercise, {path: 'user', model: 'User', match: {_id: req.body.userId}, select: {username: 1}}, function (err, exercise) {
	res.json({
	    "username": exercise.user.username,
	    "description": newExercise.description,
	    "duration": newExercise.duration,
	    "_id": newExercise.user.id,
	    "date": newExercise.date.toDateString()
	});
    });
});

let userId, matchObj, setLimit;
let responseJson = {
    "_id": "",
    "username": "",
    "from": "",
    "to": "",
    "count": 0,
    "log": []
};
app.get('/api/exercise/log', (req, res, next) => {
    try {
	if (!req.query.userId) {
	    throw new Error('Invalid userId');
	}

	userId = req.query.userId;
	User.findById(userId).exec((err, user) => {
	    if (err) {
		throw new Error(err);
	    }

	    // customize match object
	    matchObj = {user: user.id};
	    if (req.query.from && req.query.to) {
		matchObj['date'] = {
		    $gte: req.query.from,
		    $lte: req.query.to
		};
	    } else if (req.query.from) {
		matchObj['date'] = {$gte: req.query.from};
	    }

	    // limit exercises to display
	    setLimit = user.exercises.length;
	    if (req.query.limit) {
		setLimit = req.query.limit;
	    }

	    Exercise.populate(user, {path: 'exercises', model: 'Exercise', match: matchObj, select: {description: 1, duration: 1, date: 1, _id: 0}, options: {limit: setLimit}}, function (err, user) {
		// format exercises first
		let exercises = user.exercises.map((exercise) => {
		    return {
			description: exercise.description,
			duration: exercise.duration,
			date: exercise.date.toDateString()
		    };
		});
		responseJson['_id'] = user.id;
		responseJson['username'] = user.username;
		if (req.query.from) {
		    responseJson['from'] = new Date(req.query.from).toDateString();
		} else {
		    delete responseJson['from'];
		}
		if (req.query.to) {
		    responseJson['to'] = new Date(req.query.to).toDateString();
		} else {
		    delete responseJson['to'];
		}
		responseJson['count'] = exercises.length;
		responseJson['log'] = exercises;
		res.json(responseJson);
	    });
	});
    } catch (err) {
	res.send(err.message);
    }
});

module.exports = app;
