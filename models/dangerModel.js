const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dangerSchema = new Schema({
    category: {
        type: String,
        enum: ['animale-pericoloso', 'calamita-ambientale', 'sentiero-inagibile', 'altro'],
        required: true
    },
    coordinates: {type: [Number], required: true, validate: [hasTwoElements, '{PATH} doesent have 2 elements']},
    sendTimestamp: {type: Date, required: true, validate: [isPastDate, 'Must be a past date, got {VALUE}'], immutable: true},
    shortDescription: {type: String, required: true, minLenght: 10},
    userID: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true, immutable: true},
    status: {
        type: String,
        enum: ['waiting-approval', 'approved', 'rejected', 'expired'],
        required: true
    },
    expiration: {type: Date, default: null}
})

function isPastDate(val) { 
    const now = new Date()
    now.setSeconds(now.getSeconds() + 1)
    return val <= now
}

function hasTwoElements(val) {
    return val.length == 2
}

module.exports = mongoose.model('Danger', dangerSchema);