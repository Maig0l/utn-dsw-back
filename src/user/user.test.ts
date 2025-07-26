import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("user test", () => {
  it("get all, should return a list of users", async () => {
    const response = await request(url_base).get("users/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("nick");
  });

  it("get one, should not return one user", async () => {
    const response = await request(url_base).get("users/1");
    expect(response.status).toBe(404);
  });

 /* it("post one user, should create a user", async () => {
    const new_user = {
     nick: "Star",
     img: "sadsas"
    };

    const response = await request(url_base)
      .post("users")
      .send(new_user)
      .set("Content-Type", "application/json");
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("nick");
  });

  it("update, should update a user", async () => {
    const fields_to_update = {
        "nick": "Play 9",
        "img": "sadsas"
    };

    const response = await request(url_base)
      .put(`users/9`)
      .send(fields_to_update);
    expect(response.status).toBe(200);
  });
  */
});