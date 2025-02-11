const request = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')
const Danger = require('../models/dangerModel')

exports.authStandardUser = async () => {
  const resp = await request(app)
  .post('/api/v1/authentications/')
  .send({emailAddress: "standardUser@standardUser.com", password: "StandardUser1"})
  let user
  jwt.verify(resp.body.token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
    user = data;
  })
  user.token = resp.body.token
  return user
}

exports.authModerator = async () => {
  const resp = await request(app)
  .post('/api/v1/authentications/')
  .send({emailAddress: "mod@mod.com", password: "Moderator1"})
  let user
  jwt.verify(resp.body.token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
    user = data;
  })
  user.token = resp.body.token
  return user
}

exports.addDanger = async (status) => {
  const user = await this.authStandardUser()
  const danger = new Danger({
    category: 'animale-pericoloso',
    coordinates: [1, 2],
    sendTimestamp: new Date(),
    shortDescription: "Sample description of a danger",
    userID: user._id,
    status: status
  })
  await danger.save()
  return danger._id
}