const Danger = require('../models/dangerModel')
const asyncHandler = require('express-async-handler')

const refreshStatuses = asyncHandler(async (req, res, next) => {
    const dangers = await Danger.find({ status: 'approved' }).exec();
    const now = new Date()
    for(let i=0; i<dangers.length; i++) {
        if(dangers[i].expiration && dangers[i].expiration <= now) {
            await Danger.findByIdAndUpdate(dangers[i]._id, {
                status: 'expired'
            }).exec();
        }
    }
    next()
})

module.exports = refreshStatuses