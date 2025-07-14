/*import {describe, test, expect, afterEach, beforeEach} from 'vitest'
import {app} from '../src/app'
import supertest from 'supertest'

const BASE_ENDPOINT = "/api/users"
let createdUserId: number = 0

const baseUser = {
  nick: "Civy",
  email: "inbox@civy.com",
  password: "Hunterc 2!"
}
const newPass = "Hunterc 3!"

describe('User CRUD', () => {
  describe('Happy Path', () => {
    test('List all', async () => {
      let res = await supertest(app).get(BASE_ENDPOINT).send()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('length')
    })

    // Create
    test('Create new', async ()=> {
      const res = await supertest(app)
        .post(BASE_ENDPOINT)
        .send(baseUser);

      try {
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('data')
        expect(res.body.data).toHaveProperty('id')
      } catch(e) {
        console.log(res.body)
        throw new Error(`${e}\nServer replied (${res.status}): ${res.body.message}`)
      }

      createdUserId = res.body.data.id
    })

    // Read
    test('Read created entity', async () => {
      const response = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdUserId}`)
        .send()

      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
    })

    // Update
    test('Update User using PATCH', async() => {
      const res = await supertest(app)
        .patch(`${BASE_ENDPOINT}/${createdUserId}`)
        .send({password: newPass})
      
      try {
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(res.body.data.password).toEqual(newPass)
      } catch(e) {
        throw new Error(`Expected code 200, got ${res.status} with message: "${res.body.message}"`)
        throw new Error(`"${res.body.data.password}" was expected to be equal to "${newPass}"`)
      }
    })

    test('Update User using PUT', async() => {
      // createdUserId = 1
      const newData = {nick: 'Ci_Vy',
        email: 'inbox2@civy.com',
        password: 'Hunter0PUT!'
      }

      const response = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdUserId}`)
        .send(newData);
      
      try {
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data.nick).toBe(newData.nick)
        expect(response.body.data.email).toBe(newData.email)
        expect(response.body.data.password).toBe(newData.password)
      } catch(e) {
        throw new Error(`${e}\nServer replied (${response.status}): ${response.body.message}`)
      }
    })

    // Delete
    test('Delete User', async () => {
      createdUserId = 1
      let res = await supertest(app)
        .delete(`${BASE_ENDPOINT}/${createdUserId}`)
        .send()
      
      try {
        expect(res.statusCode).toBe(200)
        expect(res.body.data.id).toBe(createdUserId)
      } catch(e) {
        console.log(res.body)
        throw new Error(`${e}\nServer returned (${res.status})`)
      }

      // Volver a buscar si sigue estando
      res = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdUserId}`)
        .send()

      expect(res.statusCode).toBe(404)
    })

  })

  describe('Test errors', () => {
    test('Inexistent Studio', async () => {
      const res = await supertest(app)
        .get(`${BASE_ENDPOINT}/40296`)
        .send()
      
      expect(res.statusCode).toBe(404)
    })

    test('Invalid Studio ID', async () => {
      const res = await supertest(app)
        .get(`${BASE_ENDPOINT}/notANumber`)
        .send()
      
      expect(res.statusCode).toBe(400)
    })

    test('Empty PATCH', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send(baseUser)
      expect(res.status).toBe(201)
      let createdStudioId = res.body.data.id

      res = await supertest(app)
        .patch(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({})
      
      try {
        expect(res.status).toBe(400)
      } catch(e) {
        throw new Error(`${e}\nServer returned (${res.status}): ${res.body.message}`)
      }
    })

    test('Incomplete PUT', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send({nick: "bruh", email: "bruh@gmail.com", password: "Really Secur3!"})
      try {
        expect(res.status).toBe(201)
      } catch(e) {
        throw new Error(`${res.status}: "${res.body.message}"`)
      }
      let createdStudioId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({nick: "Platformer_enjoyer"})
      
      expect(res.status).toBe(400)
    })

    test('Other sanitizations', async () => {
      let invalidUser = baseUser
      invalidUser.email = "Clearly not an Email"

      let res = await supertest(app).post(BASE_ENDPOINT).send(invalidUser).send()
      expect(res.status).toBe(400)
    })
  })
})*/