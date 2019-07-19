// /models/user.js

'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }]
});

module.exports = mongoose.model('User', userSchema);
