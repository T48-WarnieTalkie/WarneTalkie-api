var express = require('express');
var router = express.Router();

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose')
const createHttpError = require('http-errors')
const User = require('../models/userModel');
const authorizeUser = require('../middleware/authorizeUser');
const UserSensitive = require('../models/userSensitiveModel');

router.post('/', asyncHandler(async (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    surname: req.body.surname,
    userSensitiveID: req.body.userSensitiveID
  })
  try {await newUser.validate()}
  catch(e) {throw createHttpError(400, e.message)}
  let userSensitive = UserSensitive.findById(req.body.userSensitiveID)
  if(!userSensitive) {throw createHttpError(400)}
  let existingUser = await User.findOne({
    userSensitiveID: req.body.userSensitiveID
  })
  if(existingUser) {throw createHttpError(409)}
  await newUser.save()
  res.location(newUser._id) 
  res.status(201).send()
}))

router.get('/:userID', asyncHandler(async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.userID)) {throw createHttpError(404)}
  let user = await User.findById(req.params.userID).exec();
  if(!user) {throw createHttpError(404)}
  res.status(200).json(user)
}))

router.patch('/:userID', authorizeUser, asyncHandler(async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.userID)) {throw createHttpError(404)}
  if(!await User.findById(req.params.userID)) {throw createHttpError(404)}
  if(req.user._id !== req.params.userID) {throw createHttpError(403)}
  await User.findByIdAndUpdate(req.params.userID, req.body,
    {runValidators: true})
  .catch(err => {
    if(err instanceof mongoose.Error.ValidationError) {
      throw createHttpError(400, err.message)
    }
  })
  res.status(204).send()
}))

module.exports = router;
