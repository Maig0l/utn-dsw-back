import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("franchise test", () => {
  it("get all, should return a list of franchises", async () => {
    const response = await request(url_base).get("franchises/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("name");
  });

  it("get one, should return only one franchise", async () => {
    const response = await request(url_base).get("franchises/1");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("name");
    expect(!Array.isArray(response.body.data)).toBe(true);
  });

/*  it("post one franchise, should create a franchise", async () => {
    const new_franchise = {
     name: "Star"
    };

    const response = await request(url_base)
      .post("franchises")
      .send(new_franchise)
      .set("Content-Type", "application/json");
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("name");
  });

  it("update, should update a franchise", async () => {
    const fields_to_update = {
      name: "Fantasdasya asasyy"
    };

    const response = await request(url_base)
      .put(`franchises/9`)
      .send(fields_to_update);
    expect(response.status).toBe(200);
  });
  */
});