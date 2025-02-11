const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSensitiveSchema = new Schema({
    cellphoneNumber: {type: String, required: true, unique: true, dropDups: true, minLength: 10, maxLength: 10},
    emailAddress: {type: String, required: true, unique: true, dropDups: true, validate: [isValidEmail, "Invalid email"]},
    password: {type: String, required: true, immutable: true, validate: [isValidPassword, "Invalid password"]}
})

function isValidPassword(val) {
    return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(val)
}

function isValidEmail(val) {
    return /.*@.*/.test(val)
}
module.exports = mongoose.model('UserSensitive', userSensitiveSchema);