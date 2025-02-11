const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dangerCommentSchema = new Schema({
    userID: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    dangerID: {type: mongoose.Schema.Types.ObjectId, ref:'Danger', required: true},
    sendTimestamp: {type: Date, required: true, validate: [dateValidator, 'Must be a past date, got {VALUE}']},
    text: {type: String, required: true, maxLenght: 120}
})

function dateValidator(val) { 
    return val <= new Date()
}

module.exports = mongoose.model('DangerComment', dangerCommentSchema);