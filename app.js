// /app.js

'use strict';

// Models
const User = require('./models/user');
const Exercise = require('./models/exercise');

const { check, validationResult } = require('express-validator');
const sass = require('node-sass-middleware');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const express = require('express');

// Init app
const app = express();

// Middlewares

// Font Awesome
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));

// Popper
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist/umd/'));

// jQuery
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

// Bootstrap
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));

// Sass
app.use(sass({
    src: __dirname + '/assets',
    dest: __dirname + '/public',
    debug: true,
    outputStyle: 'compressed'
}));

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

// CORS
app.use(cors({ optionSuccess: 200 }));

// MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(
    () => {
	console.log('database connection established');
    },
    err => {
	console.log(err);
	res.json({ "error": err });
    }
);

// Routes

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

let newUser;
app.post('/api/exercise/new-user', [check('username').exists()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
	return res.status(400).send('"username" is required');
    }
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
