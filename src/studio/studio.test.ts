import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("studio test", () => {
  it("get all, should return a list of studios", async () => {
    const response = await request(url_base).get("studios/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("name");
  });

  it("get one, should return only one studio", async () => {
    const response = await request(url_base).get("studios/1");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("name");
    expect(!Array.isArray(response.body.data)).toBe(true);
  });

  /*it("post one studio, should create a studio", async () => {
    const new_studio = {
      name: "asdasd asasyy",
      type: "Desarrollador",
      site: "https://store.steampowered.com"
    };

    const response = await request(url_base)
      .post("studios")
      .send(new_studio)
      .set("Content-Type", "application/json");
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("type");
  });

  it("update, should update a studio", async () => {
    const fields_to_update = {
      name: "Fantasdasya asasyy",
      type: "Desarrollador",
      site: ".com"
    };

    const response = await request(url_base)
      .put(`studios/3`)
      .send(fields_to_update);
    expect(response.status).toBe(200);
  });
  */
});