var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const DangerComment = require('../models/dangerCommentModel');

const asyncHandler = require('express-async-handler');
const createHttpError = require('http-errors');
const authorizeUser = require('../middleware/authorizeUser');
const User = require('../models/userModel');
const Danger = require('../models/dangerModel')

router.get('/', asyncHandler(async (req, res, next) => {
  let query = {};
  if(req.query.status) {query.dangerID = req.query.dangerID} 
  if(req.query.userID) {query.userID = req.query.userID} 
  res.status(200).json(
    await DangerComment.find(query)
    .sort('-sendTimestamp')
    .exec())
}))

router.post('/', authorizeUser, asyncHandler(async (req, res, next) => {
  const comment = new DangerComment({
    userID: req.body.userID,
    dangerID: req.body.dangerID,
    sendTimestamp: req.body.sendTimestamp,
    text: req.body.text
  })
  try {await comment.validate()} catch(e) {throw createHttpError(400, e.message)}
  const user = await User.findById(req.body.userID).exec()
  const danger = await Danger.findById(req.body.dangerID).exec()
  if(!user || !danger) {throw createHttpError(400)}
  if(req.user._id !== req.body.userID) {
    throw createHttpError(403)
  }
  await comment.save();
  res.location(comment._id)
  res.status(201).send()
}))

router.get('/:dangerCommentID', asyncHandler(async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.dangerCommentID)) {throw createHttpError(404)}
  const comment = await DangerComment.findById(req.params.dangerCommentID)
  .exec();
  if(!comment) {throw createHttpError(404);}
  res.status(200).json(comment)
}))

router.patch('/:dangerCommentID', authorizeUser, asyncHandler(async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.dangerCommentID)) {throw createHttpError(404)}
  const comment = await DangerComment.findById(req.params.dangerCommentID)
  if(!comment) {
    throw createHttpError(404)
  }
  if(!req.user.isModerator && !comment.userID.equals(req.user._id)) {
    throw createHttpError(403)
  }
  await DangerComment.findByIdAndUpdate(req.params.dangerCommentID, req.body, 
    {runValidators: true})
  .catch((err) => {
    if(err instanceof mongoose.Error.ValidationError) {
      throw createHttpError(400, err.message)
    }
  })
  res.status(204).send()
}))

router.delete('/:dangerCommentID', authorizeUser, asyncHandler(async (req, res, next) => {
  const comment = await DangerComment.findById(req.params.dangerCommentID)
  if(!comment) {throw createHttpError(404)}
  if(!req.user.isModerator && !comment.userID.equals(req.user._id)) {
    throw createHttpError(403)
  }
  await DangerComment.findByIdAndDelete(req.params.dangerCommentID)
  res.status(204).send()
}))

module.exports = router;
