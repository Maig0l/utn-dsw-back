import request from "supertest";

const url_base = "http://localhost:8080/api/"



describe("tag test", () => {

   


    it("get all, should return a list of tags", async () => {
        const response = await request(url_base).get("tags/")
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data.length).toBeGreaterThan(0)
        expect(response.body.data[0]).toHaveProperty("name")
       
    })

    it("get one, should return only one tag", async () => {
        const response = await request(url_base).get("tags/6")
        expect(response.status).toBe(200)
        expect(response.body.data).toHaveProperty("name")
        expect(!(Array.isArray(response.body.data))).toBe(true)
    
    })

    it("post one tag, should create a tag", async () => {
        const new_tag = {
            name: "Fantasdasya asasyy",
            description: "Cosos asgdashdhhf"
           
          }

        const response = await request(url_base).post("tags").send(new_tag).set('Content-Type', 'application/json')
        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty("name")
    })


    it("update, should update a tag", async () => {
        const fields_to_update = {
            name: "Fantasdasya asasyy",
            description: "Cosos asgdashdhhf"
           
          }


        const response = await request(url_base).put(`tags/16`).send(fields_to_update)
        expect(response.status).toBe(200)
    })






})