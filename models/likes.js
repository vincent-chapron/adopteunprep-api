var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

let LikeSchema = new mongoose.Schema({
    project_id: {
        type: Number,
        required: true
    },
    session_id: {
        type: Number,
        required: true
    },
    group_id: {
        type: Number
    },
    login: {
        type: String,
        lowercase: true,
        required: true
    },
    like: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Like', LikeSchema);
