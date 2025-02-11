var express = require('express');
var router = express.Router();

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const createHttpError = require('http-errors')
const UserSensitive = require('../models/userSensitiveModel')
const authorizeUser = require('../middleware/authorizeUser')

router.post('/', asyncHandler(async (req, res, next) => {
  let newUserSensitive = new UserSensitive({
    cellphoneNumber: req.body.cellphoneNumber,
    emailAddress: req.body.emailAddress,
    password: req.body.password? await bcrypt.hash(req.body.password, 10) : null
  })
  try {await newUserSensitive.validate()}
  catch(e) {throw createHttpError(400, e.message)}
  let existingUserSensitive = await UserSensitive.findOne({
    $or: [{cellphoneNumber: req.body.cellphoneNumber}, {emailAddress: req.body.emailAddress}]
  }).exec();
  if(existingUserSensitive) {throw createHttpError(409)}
  await newUserSensitive.save()
  res.location(newUserSensitive._id)
  res.setHeader('Access-Control-Expose-Headers', 'Location')
  res.status(201).send()
}))

router.get('/:userSensitiveID', authorizeUser, asyncHandler(async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.userSensitiveID)) {throw createHttpError(404)}
  let userSensitive = await UserSensitive.findById(req.params.userSensitiveID).exec();
  if(!userSensitive) {throw createHttpError(404)}
  if(!req.user.isModerator && req.user.userSensitiveID !== req.params.userSensitiveID) {throw createHttpError(403)}
  res.status(200).json(userSensitive)
}))

router.patch('/:userSensitiveID', authorizeUser, asyncHandler(async (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.userSensitiveID)) {throw createHttpError(404)}
  if(!await UserSensitive.findById(req.params.userSensitiveID)) {throw createHttpError(404)}
  if(req.user.userSensitiveID !== req.params.userSensitiveID) {throw createHttpError(403)}
  let existingUserSensitive = await UserSensitive.find({
    $or: [{cellphoneNumber: req.body.cellphoneNumber}, {emailAddress: req.body.emailAddress}],
    _id: {$ne: req.user.userSensitiveID}
  }).exec();
  if(existingUserSensitive.length>0) {throw createHttpError(409)}
  await UserSensitive.findByIdAndUpdate(req.params.userSensitiveID, req.body,
    {runValidators: true})
  .catch(err => {
    if(err instanceof mongoose.Error.ValidationError) {
      throw createHttpError(400, err.message)
    }
  })
  res.status(204).send()
}))

module.exports = router;
