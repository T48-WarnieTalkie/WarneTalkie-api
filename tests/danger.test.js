const request = require('supertest')
const app = require('../app')
const {authStandardUser, authModerator, postDanger} = require('./testUtils')

describe('/api/v1/dangers', () => {
  describe('GET', () => {
    test('without query parameters', async () => {
      await request(app)
      .get('/api/v1/dangers')
      .expect(200)
    })

    test('with query parameters', async () => {
      const resp = await authStandardUser()
      await request(app)
      .get('/api/v1/dangers')
      .query({status: 'waiting-approval', userId: resp.userID})
      .expect(200)
    })
  }) 

  describe('POST', () => {
    test('good request body', async () => {
      const resp = await authStandardUser()
      await request(app)
      .post('/api/v1/dangers')
      .set('Authorization', 'Bearer ' + resp.token)
      .send({
        category: 'animale-pericoloso',
        coordinates: [1, 2],
        sendTimestamp: new Date(),
        shortDescription: "Ho visto un lupo in zona Sardagna, sembra affamato",
        status: 'waiting-approval',
        userID: resp.userID
      }).expect(201)
    })

    test('bad request body', async () => {
      const resp = await authStandardUser()
      await request(app)
      .post('/api/v1/dangers')
      .set('Authorization', 'Bearer ' + resp.token)
      .send({
        category: 'a bad category',
        coordinates: [1, 2],
        sendTimestamp: new Date(),
        shortDescription: "",
        status: 'waiting-approval',
        userID: resp.userID
      }).expect(400)
    })

    test('no JWT', async () => {
      const resp = await authStandardUser()
      await request(app)
      .post('/api/v1/dangers')
      .send({
        category: 'animale-pericoloso',
        coordinates: [1, 2],
        sendTimestamp: new Date(),
        shortDescription: "Ho visto un lupo in zona Sardagna, sembra affamato",
        status: 'waiting-approval',
        userID: resp.userID
      }).expect(401)
    })

    test('with a forbidden status', async () => {
      const resp = await authStandardUser()
      await request(app)
      .post('/api/v1/dangers')
      .set('Authorization', 'Bearer ' + resp.token)
      .send({
        category: 'animale-pericoloso',
        coordinates: [1, 2],
        sendTimestamp: new Date(),
        shortDescription: "Ho visto un lupo in zona Sardagna, sembra affamato",
        status: 'approved',
        userID: resp.userID
      }).expect(403)
    })
  })
})

describe('/api/v1/dangers/:dangerID', () => {
  describe('GET', () => {
    
    test('with invalid dangerID', async () => {
      await request(app)
      .get('/dangers/' + 'anInvalidDangerID')
      .expect(404)
    })
  })
})




