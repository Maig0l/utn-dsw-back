import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("shop test", () => {
  it("get all, should return a list of shops", async () => {
    const response = await request(url_base).get("shops/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("name");
  });

  it("get one, should return only one shop", async () => {
    const response = await request(url_base).get("shops/1");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("name");
    expect(!Array.isArray(response.body.data)).toBe(true);
  });

  /*it("post one shop, should create a shop", async () => {
    const new_shop = {
     name: "Star",
      img: "https://store.steampowered.com",
      site: "https://store.steampowered.com"
    };

    const response = await request(url_base)
      .post("shops")
      .send(new_shop)
      .set("Content-Type", "application/json");
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("name");
  });

  it("update, should update a shop", async () => {
    const fields_to_update = {
      name: "Fantasdasya asasyy",
      img: "https://store.steampowered.com",
      site: ".com"
    };

    const response = await request(url_base)
      .put(`shops/14`)
      .send(fields_to_update);
    expect(response.status).toBe(200);
  });
  */
});