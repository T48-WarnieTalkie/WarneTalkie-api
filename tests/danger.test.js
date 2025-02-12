const request = require('supertest')
const app = require('../app')
const {authStandardUser, authModerator, addDanger} = require('./testUtils')
const Danger = require('../models/dangerModel')
const mongoose = require('mongoose')
describe('/api/v1/dangers', () => {

  beforeAll(async () => {
    jest.setTimeout(8000)
    app.locals.db = await mongoose.connect(process.env.DB_URL)
  })

  afterAll(async () => {mongoose.connection.close(true)})
  
  test('5) get a danger', async () => {
    const user = await authStandardUser()
    const dangerID = await addDanger('approved')
    await request(app)
    .get('/api/v1/dangers/' + dangerID)
    .set('Authorization', 'Bearer ' + user.token)
    .expect(200)
    await Danger.findByIdAndDelete(dangerID)
  })

  test('6) send a danger with correct info', async () => {
    const user = await authStandardUser()
    const resp = await request(app)
    .post('/api/v1/dangers')
    .set('Authorization', 'Bearer ' + user.token)
    .send({
      category: 'animale-pericoloso',
      coordinates: [1, 2],
      sendTimestamp: new Date(),
      shortDescription: "Ho visto un lupo in zona Sardagna, sembra affamato",
      status: 'waiting-approval',
      userID: user._id
    }).expect(201)
    await Danger.findByIdAndDelete(resp.headers.location)
  })

  test('6.1) send a danger with an invalid field', async () => {
    const user = await authStandardUser()
    await request(app)
    .post('/api/v1/dangers')
    .set('Authorization', 'Bearer ' + user.token)
    .send({
      category: 'a bad category', //invalid category field
      coordinates: [1, 2],
      sendTimestamp: new Date(),
      shortDescription: "short", //short description
      status: 'waiting-approval',
      userID: user._id
    }).expect(400)
  })

  test('7) approve a danger', async () => {
    const dangerID = await addDanger('waiting-approval')
    const mod = await authModerator()
    await request(app)
    .patch('/api/v1/dangers/' + dangerID)
    .set('Authorization', 'Bearer ' + mod.token)
    .send({
      status: 'approved',
      expiration: new Date()
    }).expect(204)
    await Danger.findByIdAndDelete(dangerID)
  })

  test('8) reject a danger', async () => {
    const dangerID = await addDanger('waiting-approval')
    const mod = await authModerator()
    await request(app)
    .patch('/api/v1/dangers/' + dangerID)
    .set('Authorization', 'Bearer ' + mod.token)
    .send({
      status: 'rejected'
    }).expect(204)
    await Danger.findByIdAndDelete(dangerID)
  })

  test('9) modify expiration of a danger', async () => {
    const dangerID = await addDanger('approved')
    const mod = await authModerator()
    await request(app)
    .patch('/api/v1/dangers/' + dangerID)
    .set('Authorization', 'Bearer ' + mod.token)
    .send({
      expiration: new Date()
    }).expect(204)
    await Danger.findByIdAndDelete(dangerID)
  })

  test('10) terminate a danger', async () => {
    const dangerID = await addDanger('approved')
    const mod = await authModerator()
    await request(app)
    .patch('/api/v1/dangers/' + dangerID)
    .set('Authorization', 'Bearer ' + mod.token)
    .send({
      status: 'expired',
      expiration: new Date()
    }).expect(204)
    await Danger.findByIdAndDelete(dangerID)
  })

  test('11) get active dangers', async () => {
    await request(app)
    .get('/api/v1/dangers/?status=approved')
    .expect(200)
  })

})


