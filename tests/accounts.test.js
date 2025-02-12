const request = require('supertest')
const app = require('../app')
const {authStandardUser, authModerator, postDanger} = require('./testUtils')
const UserSensitive = require('../models/userSensitiveModel')
const User = require('../models/userModel')
const mongoose = require('mongoose')

describe('accounts', () => {

  beforeAll(async () => {
    jest.setTimeout(8000)
    app.locals.db = await mongoose.connect(process.env.DB_URL)
  })

  afterAll(async () => {mongoose.connection.close(true)})

  test('1) create account correctly', async () => {
    let userSensitiveID
    let userID

    const respSensitives = await request(app)
    .post('/api/v1/userSensitives')
    .send({
      cellphoneNumber: "9999999999",
      emailAddress: "example@example.com",
      password: "ExamplePassword"
    })
    userSensitiveID = respSensitives.headers.location
    expect(respSensitives.status).toBe(201)

    const respUser = await request(app)
    .post('/api/v1/users')
    .send({
      name: "ExampleName",
      surname: "ExampleSurname",
      userSensitiveID: userSensitiveID
    })
    userID = respUser.headers.location
    
    await UserSensitive.findByIdAndDelete(userSensitiveID).exec()
    await User.findByIdAndDelete(userID).exec()

    expect(respSensitives.status).toBe(201)
  })

  describe('1.1) create account with existing emailAddress or cellphoneNumber', () => {
    test('POST /userSensitives existing cellphone number', async () => {
      await request(app)
      .post('/api/v1/userSensitives')
      .send({
        cellphoneNumber: "0000000000", //mod's phone number
        emailAddress: "example@example.com",
        password: "ExamplePassword"
      }).expect(409)
    })
    test('POST /userSensitives existing email address', async () => {
      await request(app)
      .post('/api/v1/userSensitives')
      .send({
        cellphoneNumber: "9999999999",
        emailAddress: "mod@mod.com", //mod's email adress
        password: "ExamplePassword"
      }).expect(409)
    })
  })
  describe('1.2) create account with invalid info', () => {
    test('POST /userSensitives invalid info', async () => {
      await request(app)
      .post('/api/v1/userSensitives')
      .send({
        cellphoneNumber: "10", //invalid cellphoneNumber
        emailAddress: "example@example.com",
        password: "ExamplePassword"
      }).expect(400)
    })
    test('POST /user invalid info', async () => {
      await request(app)
      .post('/api/v1/userSensitives')
      .send({
        name: "", //empty name
        surname: "ExampleSurname"
      }).expect(400) //no userSensitiveID
    })
  })

  test('2) login with correct credentials', async () => {
    await request(app)
    .post('/api/v1/authentications/')
    .send({emailAddress: "standardUser@standardUser.com", password: "StandardUser1"})
    .expect(200)
  })

  test('2.1) login with wrong credentials', async () => {
    await request(app)
    .post('/api/v1/authentications/')
    .send({emailAddress: "wrongEmail@wrongEmail.com", password: "AWrongPassword"})
    .expect(403)
  })

  test('3) view personal info', async () => {
    const standardUser = await authStandardUser()
    await request(app)
    .get('/api/v1/userSensitives/' + standardUser.userSensitiveID)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .expect(200)

    await request(app)
    .get('/api/v1/users/' + standardUser._id)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .expect(200)
  })

  test('4) modify personal info', async () => {
    const standardUser = await authStandardUser()
    await request(app)
    .patch('/api/v1/userSensitives/' + standardUser.userSensitiveID)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      emailAddress: 'standardUser1@standardUser.com',
      cellphoneNumber: '1111111112'
    })
    .expect(204)

    await request(app)
    .patch('/api/v1/users/' + standardUser._id)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      name: 'Standard1',
      surname: 'User1'
    })
    .expect(204)

    //undo modifications
    await request(app)
    .patch('/api/v1/userSensitives/' + standardUser.userSensitiveID)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      emailAddress: 'standardUser@standardUser.com',
      cellphoneNumber: '1111111111'
    })
    .expect(204)

    await request(app)
    .patch('/api/v1/users/' + standardUser._id)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      name: 'StandardUser',
      surname: 'StandardUser'
    })
    .expect(204)
  })

  test('4.1) modify personal info with exising email', async () => {
    const standardUser = await authStandardUser()
    await request(app)
    .patch('/api/v1/userSensitives/' + standardUser.userSensitiveID)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      emailAddress: 'mod@mod.com'
    })
    .expect(409)

    await request(app)
    .patch('/api/v1/userSensitives/' + standardUser.userSensitiveID)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      cellphoneNumber: '0000000000'
    })
    .expect(409)
  })

  test('4.2) modify personal info with invalid field', async () => {
    const standardUser = await authStandardUser()
    await request(app)
    .patch('/api/v1/userSensitives/' + standardUser.userSensitiveID)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      emailAddress: 'emailAdressWithoutAt', //invalid email address
      cellphoneNumber: '10' //invalid cellphone number
    })
    .expect(400)

    await request(app)
    .patch('/api/v1/users/' + standardUser._id)
    .set('Authorization', 'Bearer ' + standardUser.token)
    .send({
      name: '', //empty name
    })
    .expect(400)
  })
})