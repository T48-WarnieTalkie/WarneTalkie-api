var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const Danger = require('../models/dangerModel');

const asyncHandler = require('express-async-handler');
const createHttpError = require('http-errors');
const authorizeUser = require('../middleware/authorizeUser')

router.get('/', asyncHandler(async (req, res, next) => {
  let query = {};
  if(req.query.status) {query.status = req.query.status} 
  if(req.query.userID) {query.userID = req.query.userID} 
  res.status(200).json(
    await Danger.find(query)
    .sort('-sendTimestamp')
    .exec())
}))

router.post('/', authorizeUser, asyncHandler(async (req, res, next) => {
  const danger = new Danger({
    category: req.body.category,
    coordinates: req.body.coordinates?.map(function(x) {
        return parseFloat(x);
    }),
    sendTimestamp: req.body.sendTimestamp,
    shortDescription: req.body.shortDescription,
    userID: req.body.userID,
    status: req.body.status
  })
  try {await danger.validate()} catch(e) {throw createHttpError(400, e.message)}
  if(req.user._id !== req.body.userID || req.body.status !== 'waiting-approval') {
    throw createHttpError(403)
  }
  await danger.save();
  res.location(danger._id)
  res.status(201).send()
}))

router.get('/:dangerId', asyncHandler(async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.dangerId)) {throw createHttpError(404)}
  const danger = await Danger.findById(req.params.dangerId)
  .exec();
  if(!danger) {throw createHttpError(404, "Danger not found");}
  res.status(200).json(danger)
}))

router.patch('/:dangerID', authorizeUser, asyncHandler(async (req, res, next) => {
  if(!req.user.isModerator) {
    throw createHttpError(403)
  }
  if(!mongoose.Types.ObjectId.isValid(req.params.dangerID)) {throw createHttpError(404, "Danger not found")}
    const danger = await Danger.findByIdAndUpdate(req.params.dangerID, req.body, {
      runValidators: true, new: true
    })
    .catch((err) => {
      if(err instanceof mongoose.Error.ValidationError) {
        throw createHttpError(400, err.message)
      }
    })
    if(!danger) {
      throw createHttpError(404, "Danger not found")
    }
    res.status(204).send()
}))

router.delete('/:dangerID', authorizeUser, asyncHandler(async (req, res, next) => {
  const danger = await Danger.findById(req.params.dangerID)
  if(!danger) {throw createHttpError(404)}
  if(danger.status !== 'waiting-approval' || !danger.userID.equals(req.user._id)) {
    throw createHttpError(403)
  }
  await Danger.findByIdAndDelete(req.params.dangerID)
  res.status(204).send()
}))

module.exports = router;
