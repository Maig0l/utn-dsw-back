import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("platform test", () => {
  it("get all, should return a list of platforms", async () => {
    const response = await request(url_base).get("platforms/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("name");
  });

  it("get one, should return only one platform", async () => {
    const response = await request(url_base).get("platforms/1");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("name");
    expect(!Array.isArray(response.body.data)).toBe(true);
  });

 /* it("post one platform, should create a platform", async () => {
    const new_platform = {
     name: "Star",
     img: "sadsas"
    };

    const response = await request(url_base)
      .post("platforms")
      .send(new_platform)
      .set("Content-Type", "application/json");
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("name");
  });

  it("update, should update a platform", async () => {
    const fields_to_update = {
        "name": "Play 9",
        "img": "sadsas"
    };

    const response = await request(url_base)
      .put(`platforms/9`)
      .send(fields_to_update);
    expect(response.status).toBe(200);
  });
  */
});