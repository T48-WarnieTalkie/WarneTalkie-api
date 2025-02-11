const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dangerSchema = new Schema({
    category: {
        type: String,
        enum: ['animale-pericoloso', 'calamita-ambientale', 'sentiero-inagibile', 'altro'],
        required: true
    },
    coordinates: {type: [Number], required: true, validate: [coordValidator, '{PATH} doesent have 2 elements']},
    sendTimestamp: {type: Date, required: true, validate: [dateValidator, 'Must be a past date, got {VALUE}']},
    shortDescription: {type: String, required: true, maxLenght: 120},
    userID: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    status: {
        type: String,
        enum: ['waiting-approval', 'approved', 'rejected', 'expired'],
        required: true
    },
    expiration: {type: Date, default: null}
})

function dateValidator(val) { 
    return val <= new Date()
}

function coordValidator(val) {
    return val.length == 2
}

module.exports = mongoose.model('Danger', dangerSchema);