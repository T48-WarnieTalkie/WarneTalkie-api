const mongoose = require('mongoose');
const userSensitive = require('./userSensitiveModel');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    isModerator: {type: Boolean, required: true, default: false},
    userSensitiveID: {type: mongoose.Schema.Types.ObjectId, ref: userSensitive.modelName, required: true, immutable: true},
})

module.exports = mongoose.model('User', userSchema);