import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("game test", () => {
  it("get all, should return a list of games", async () => {
    const response = await request(url_base).get("games/")
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThan(0)
    expect(response.body.data[0]).toHaveProperty("title")
   
})

it("get one, should return only one game", async () => {
    const response = await request(url_base).get("games/4")
    expect(response.status).toBe(200)
    expect(response.body.data).toHaveProperty("title")
    expect(!(Array.isArray(response.body.data))).toBe(true)
  })
});
