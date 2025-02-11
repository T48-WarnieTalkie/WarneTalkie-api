var express = require('express');
var router = express.Router();
const UserSensitive = require('../models/userSensitiveModel');
const User = require('../models/userModel')
const createHttpError = require('http-errors')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/', asyncHandler(async (req, res, next) => {
  if(!req.body.emailAddress || !req.body.password) {
      throw createHttpError(400);
    }
  const userSensitive = await UserSensitive.findOne({
    emailAddress: req.body.emailAddress
  }).exec();
  if(!userSensitive || !await bcrypt.compare(req.body.password, userSensitive.password)) {
    throw createHttpError(403);
  }
  const user = await User.findOne({
    userSensitiveID: userSensitive._id
  })
  if(!user) {throw createHttpError(404)}
  res.status(200).json({
    token: jwt.sign({
      _id: user._id,
      isModerator: user.isModerator,
      userSensitiveID: userSensitive._id
    }, process.env.ACCESS_TOKEN_SECRET),
    userID: user._id,
  })
}))

module.exports = router;