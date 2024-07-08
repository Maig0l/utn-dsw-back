import {describe, test, expect, afterEach, beforeEach} from 'vitest'
import {app} from '../src/app'
import supertest from 'supertest'

const BASE_ENDPOINT = "/api/shops"
let createdShopId = null

const baseShop = {
  name: "GOG Games",
  img: "/assets/gog.svg",
  site: "http://gogames.com"
}
const newName = "GOG"

describe('Shop CRUD API', () => {
  describe('Happy Path', () => {
    test('List all shops', async () => {
      let res = await supertest(app).get(BASE_ENDPOINT).send()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('length')
    })

    // Create
    test('Create a new Shop', async ()=> {
      let repoTotal = await supertest(app).get('/api/shops').send()
      let repoSizeBefore = repoTotal.body.data.length

      const response = await supertest(app)
        .post('/api/shops')
        .send({name: 'GOG Games',
                img: '/assets/gog.svg',
                site: 'http://gog.com'});

      if (response.statusCode !== 201)
        throw new Error(`Expected code 201 but got ${response.statusCode}. Message: ${response.body.message}`)
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')

      repoTotal = await supertest(app).get('/api/shops').send()
      let repoSizeAfter = repoTotal.body.data.length

      expect(repoSizeAfter - repoSizeBefore).toBe(1)

      createdShopId = response.body.data.id
    })

    // Read
    test('Read the created Shop', async () => {
      const response = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdShopId}`)
        .send()

      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
    })

    // Update
    test('Update Shop using PATCH', async() => {
      const res = await supertest(app)
        .patch(`${BASE_ENDPOINT}/${createdShopId}`)
        .send({name: 'GOG'})
      
      try {
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('data')
        expect(res.body.data.name).toBe('GOG')
      } catch(e) {
        throw new Error(`Expected code 200, got ${res.status} with message: "${res.body.message}"`)
      }
    })

    test('Update Shop using PUT', async() => {
      const newData = {name: 'GOG',
        img: '/assets/shops/gog.svg',
        site: 'https://gog.com'
      }

      const response = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdShopId}`)
        .send(newData);
      
      // CONSULTA: Tiene que haber una mejor forma de testear esto
      // ^ Nope, se hace así.
      // Esto es "Integration testing"
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      // Algo así expect(response.body.data).toEqual(newData) //Falta el ID igual

      // Modificar solo en newData
      expect(response.body.data.name).toBe(newData.name)
      expect(response.body.data.img).toBe(newData.img)
      expect(response.body.data.site).toBe(newData.site)
    })

    // Delete
    test('Delete Shop', async () => {
      let res = await supertest(app)
        .delete(`${BASE_ENDPOINT}/${createdShopId}`)
        .send()
      
      expect(res.statusCode).toBe(200)
      expect(res.body.data.id).toBe(createdShopId)

      // Volver a buscar si sigue estando
      res = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdShopId}`)
        .send()

      expect(res.statusCode).toBe(404)
    })

  })

  describe('Test errors', () => {
    test('Inexistent Shop', async () => {
      const res = await supertest(app)
        .get(`${BASE_ENDPOINT}/40296`)
        .send()
      
      expect(res.statusCode).toBe(404)
    })

    test('Invalid Shop ID', async () => {
      const res = await supertest(app)
        .get(`${BASE_ENDPOINT}/notANumber`)
        .send()
      
      expect(res.statusCode).toBe(400)
    })

    test('Empty PATCH', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send(baseShop)
      let createdShopId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdShopId}`)
        .send({})
      
      expect(res.status).toBe(400)
    })

    test('Incomplete PUT', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send(baseShop)
      let createdShopId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdShopId}`)
        .send({name: "GOG"})
      
      expect(res.status).toBe(400)
    })

    test('Other sanitizations', async () => {
      let invalidShop = baseShop
      invalidShop.site = "Clearly not a website"

      let res = await supertest(app).post(BASE_ENDPOINT).send(invalidShop).send()
      expect(res.status).toBe(400)
    })
  })
})