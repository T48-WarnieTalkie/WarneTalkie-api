const createHttpError = require('http-errors')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')

const authorizeUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]
  if(token == null){ throw createHttpError(401)}

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
      if(err) {throw createHttpError(401)}
      req.user = data;
      next()
  })
})

module.exports = authorizeUser