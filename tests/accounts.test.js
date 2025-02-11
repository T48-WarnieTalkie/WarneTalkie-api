//.set('Authorization', 'Bearer ' + resp.token)

describe('account tests', () => {
  describe('POST /userSensitives', async () => {
    test('good request body', async () => {
      await request(app)
      .post('/api/v1/userSensitives')
      .send({
        cellphoneNumber: "9999999999",
        emailAddress: "example@example.com",
        password: "Example1"
      }).expect(201)
    })
  })
})