import {describe, it, expect} from 'vitest'
import {app} from '../src/app'
import supertest from 'supertest'
import { create } from 'domain'

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
    it('List all shops', async () => {
      let res = await supertest(app).get(BASE_ENDPOINT).send()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('length')
    })

    // Create
    it('Create a new Shop', async ()=> {
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
    it('Read the created Shop', async () => {
      const response = await supertest(app)
        .get(`${BASE_ENDPOINT}/${createdShopId}`)
        .send()

      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
    })

    // Update
    it('Update Shop using PATCH', async() => {
      const response = await supertest(app)
        .patch(`${BASE_ENDPOINT}/${createdShopId}`)
        .send({name: 'GOG'})
      
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.name).toBe('GOG')
    })

    it('Update Shop using PUT', async() => {
      const newData = {name: 'GOG',
        img: '/assets/shops/gog.svg',
        site: 'https://gog.com'
      }

      const response = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdShopId}`)
        .send(newData);
      
      // CONSULTA: Tiene que haber una mejor forma de testear esto
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data.name).toBe('GOG')
      expect(response.body.data.img).toBe('/assets/shops/gog.svg')
      expect(response.body.data.site).toBe('https://gog.com')
    })

    // Delete
    it('Delete Shop', async () => {
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

  describe('Shop Guard middlewarez', () => {
    it('Inexistent Shop', async () => {
      const res = await supertest(app)
        .get(`${BASE_ENDPOINT}/40296`)
        .send()
      
      expect(res.statusCode).toBe(404)
    })

    it('Invalid Shop ID', async () => {
      const res = await supertest(app)
        .get(`${BASE_ENDPOINT}/notANumber`)
        .send()
      
      expect(res.statusCode).toBe(400)
    })

    it('Empty PATCH', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send(baseShop)
      let createdShopId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdShopId}`)
        .send({})
      
      expect(res.status).toBe(400)
    })

    it('Incomplete PUT', async () => {
      let res = await supertest(app).post(BASE_ENDPOINT).send(baseShop)
      let createdShopId = res.body.data.id

      res = await supertest(app)
        .put(`${BASE_ENDPOINT}/${createdShopId}`)
        .send({name: "GOG"})
      
      expect(res.status).toBe(400)
    })
  })
})