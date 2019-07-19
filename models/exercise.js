// /models/exercise.js

'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    description: String,
    duration: Number,
    date: { type: Date, default: Date.now() },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
