const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSensitiveSchema = new Schema({
    cellphoneNumber: {type: String, required: true, unique: true, dropDups: true},
    emailAddress: {type: String, required: true, unique: true, dropDups: true},
    password: {type: String, required: true, immutable: true, validate: [isValidPassword, "Invalid password"]}
})

function isValidPassword(val) {
    return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(val)
}
module.exports = mongoose.model('UserSensitive', userSensitiveSchema);