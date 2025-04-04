import request from "supertest";

const url_base = "http://localhost:8080/api/"



describe("game test", () => {

   


    it("should return a list of games", async () => {
        const response = await request(url_base).get("games/")
        expect(response.status).toBe(200)
       
    })


})