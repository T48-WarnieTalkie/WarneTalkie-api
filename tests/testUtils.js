const request = require('supertest')
const app = require('../app')

exports.authStandardUser = async () => {
  const resp = await request(app)
  .post('/api/v1/authentications/')
  .send({emailAddress: "standardUser@standardUser.com", password: "StandardUser1"})
  return resp.body
}

exports.authModerator = async () => {
  const resp = await request(app)
  .post('/api/v1/authentications/')
  .send({emailAddress: "moderator@moderator.com", password: "Moderator1"})
  return resp.body
}

exports.postDanger = async (status) => {
  const respAuth = this.authStandardUser()
  const resp = await request(app)
  .post('/api/v1/dangers/')
  .send({
    category: 'animale-pericoloso',
    coordinates: [1, 2],
    sendTimestamp: new Date(),
    shortDescription: "Sample description of a danger",
    userID: respAuth.userID,
    status: 'status'
  })
  return resp.headers['Location']
}