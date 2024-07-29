import { describe, test, expect } from 'vitest'
import { app } from '../src/app'
import { randomBytes } from 'crypto'
import { StudioType } from '../src/studio/studio.entity.ts'
import supertest from 'supertest'

const BASE_ENDPOINT = "/api/studios"
let createdStudioId = null

const saltedStudio = () => {
  const salt = randomBytes(6).toString('hex')
  return {
    name: `Awesome Games-${salt}`,
    type: [StudioType.Publisher],
    site: `http://awesomegames.com.ar/${salt.substring(0,2)}`
  }
}

describe('Studio CRUD API', () => {
  describe('Happy Path', () => {
    test('List all studios', async () => {
      let res = await supertest(app).get(BASE_ENDPOINT).send()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('length')
    })

    // Create
    test('Create a new Studio', async ()=> {
      let repoTotal = await supertest(app).get(BASE_ENDPOINT).send()
      let repoSizeBefore = repoTotal.body.data.length

      const response = await supertest(app)
        .post(BASE_ENDPOINT)
        .send(saltedStudio())

      if (response.statusCode !== 201)
        throw new Error(`Expected code 201 but got ${response.statusCode}. Message: ${response.body.message}`)
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')

      repoTotal = await supertest(app).get(BASE_ENDPOINT).send()
      let repoSizeAfter = repoTotal.body.data.length

      expect(repoSizeAfter - repoSizeBefore).toBe(1)

      createdStudioId = response.body.data.id
    })

    // Read
    test('Read the created Studio', async () => {
      const response = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send()

      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
    })

    // Update
    test('Update Studio using PATCH', async() => {
      const newName = saltedStudio().name
      const res = await supertest(app)
        .patch(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({name: newName})
      
      try {
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(res.body.data.name).toBe(newName)
      } catch(e) {
        throw new Error(`Expected code 200, got ${res.status} with message: "${res.body.message}"`)
      }
    })

    test('Update Studio using PUT', async() => {
      const newData = {name: 'Legendary Games',
        type: [StudioType.Publisher],
        site: 'https://legendary-games.com'
      }

      const response = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send(newData);
      
      // CONSULTA: Tiene que haber una mejor forma de testear esto
      // ^ Nope, se hace así.
      // Esto es "Integration testing"
      try {
        expect(response.statusCode).toBe(200)
      } catch(e) {
        throw new Error(`Expected code 200, got ${response.status} with message: "${response.body.message}"`)
      }

      expect(response.body).toHaveProperty('data')
      // Algo así expect(response.body.data).toEqual(newData) //Falta el ID igual

      // Modificar solo en newData
      expect(response.body.data.name).toBe(newData.name)
      expect(response.body.data.img).toBe(newData.img)
      expect(response.body.data.site).toBe(newData.site)
    })

    // Delete
    test('Delete Studio', async () => {
      let res = await supertest(app)
        .delete(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send()
      
      expect(res.statusCode).toBe(200)
      expect(res.body.data.id).toBe(createdStudioId)

      // Volver a buscar si sigue estando
      res = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send()

      expect(res.statusCode).toBe(404)
    })

  })

  describe('Test errors', () => {
    test('Inexistent Studio', async () => {
      // Some day this ID will exist, and it will be funny
      //  to see us debug why the test fails
      const res = await supertest(app)
        .get(`${BASE_ENDPOINT}/420`) 
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
      let res = await supertest(app).post(BASE_ENDPOINT).send(saltedStudio())
      let createdStudioId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({})
      
      expect(res.status).toBe(400)

      //Cleanup
      await supertest(app).delete(`${BASE_ENDPOINT}/${createdStudioId}`)
    })

    test('Incomplete PUT', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send(saltedStudio())
      let createdStudioId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({name: saltedStudio().name})
      
      expect(res.status).toBe(400)

      //Cleanup
      await supertest(app).delete(`${BASE_ENDPOINT}/${createdStudioId}`)
    })

    test('Other sanitizations', async () => {
      let invalidStudio = {...saltedStudio(), site: 'contact@gog.com'}
      // invalidStudio.site = "Clearly not a website" //?

      let res = await supertest(app).post(BASE_ENDPOINT).send(invalidStudio).send()
      expect(res.status).toBe(400)
    })
  })
})