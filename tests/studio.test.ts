import {describe, test, expect, afterEach, beforeEach} from 'vitest'
import {app} from '../src/app'
import { StudioType } from '../src/studio/studio.entity.ts'
import supertest from 'supertest'

const BASE_ENDPOINT = "/api/studios"
let createdStudioId = null

const baseStudio = {
  name: "Majorariato",
  type: [StudioType.Developer],
  site: "https://www.majorariatto.com/"
}
const newType = [StudioType.Developer, StudioType.Publisher]

describe('Studio CRUD', () => {
  describe('Happy Path', () => {
    test('List all', async () => {
      let res = await supertest(app).get(BASE_ENDPOINT).send()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('length')
    })

    // Create
    test('Create new', async ()=> {
      const response = await supertest(app)
        .post(BASE_ENDPOINT)
        .send(baseStudio);

      if (response.statusCode !== 201)
        throw new Error(`Expected code 201 but got ${response.statusCode}. Message: ${response.body.message}`)
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')

      createdStudioId = response.body.data.id
    })

    // Read
    test('Read created entity', async () => {
      const response = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send()

      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
    })

    // Update
    test('Update Studio using PATCH', async() => {
      const res = await supertest(app)
        .patch(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({type: newType})
      
      try {
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(res.body.data.type).toEqual(newType)
      } catch(e) {
        // throw new Error(`Expected code 200, got ${res.status} with message: "${res.body.message}"`)
        throw new Error(`Array ${res.body.data.type} was expected to be equal to array ${newType}`)
      }
    })

    test('Update Studio using PUT', async() => {
      const newData = {name: 'Majorariatto',
        type: [StudioType.Developer],
        site: 'https://www.majorariatto.com/es'
      }

      const response = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send(newData);
      
      // CONSULTA: Tiene que haber una mejor forma de testear esto que comprobar
      //   uno por uno
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.name).toBe(newData.name)
      expect(response.body.data.type).toEqual(newData.type)
      expect(response.body.data.site).toBe(newData.site)
    })

    // Delete
    test('Delete Studio', async () => {
      let res = await supertest(app)
        .delete(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send()
      
      try {
        expect(res.statusCode).toBe(200)
        expect(res.body.data.id).toBe(createdStudioId)
      } catch(e) {
        console.log(res.body)
        throw new Error(`${e}\nServer returned (${res.status})`)
      }

      // Volver a buscar si sigue estando
      res = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdStudioId}`)
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
      let res = await supertest(app).post(BASE_ENDPOINT).send(baseStudio)
      let createdStudioId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({})
      
      expect(res.status).toBe(400)
    })

    test('Incomplete PUT', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send(baseStudio)
      let createdStudioId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdStudioId}`)
        .send({name: "GOG"})
      
      expect(res.status).toBe(400)
    })

    test('Other sanitizations', async () => {
      let invalidStudio = baseStudio
      invalidStudio.site = "Clearly not a website"

      let res = await supertest(app).post(BASE_ENDPOINT).send(invalidStudio).send()
      expect(res.status).toBe(400)
    })
  })
})