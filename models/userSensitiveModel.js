const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSensitiveSchema = new Schema({
    cellphoneNumber: {type: String, required: true, unique: true, dropDups: true, minLength: 10, maxLength: 10, validate: [isValidCellphoneNumber, "Invalid cellphone number"]},
    emailAddress: {type: String, required: true, unique: true, dropDups: true, validate: [isValidEmail, "Invalid email"]},
    password: {type: String, required: true, immutable: true, validate: [isValidPassword, "Invalid password"]}
})

function isValidCellphoneNumber(val) {
    return /[0-9]{10}/.test(val)
}

function isValidPassword(val) {
    return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(val)
}

function isValidEmail(val) {
    return /.*@.*/.test(val)
}
module.exports = mongoose.model('UserSensitive', userSensitiveSchema);