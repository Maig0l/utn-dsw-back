import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("review test", () => {
  it("get all, should return a list of reviews", async () => {
    const response = await request(url_base).get("reviews/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("author");
  });

  it("get one, should return only one review", async () => {
    const response = await request(url_base).get("reviews/1");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("author");
    expect(!Array.isArray(response.body.data)).toBe(true);
  });

 /* it("post one review, should create a review", async () => {
    const new_review = {
     author: "Star",
     img: "sadsas"
    };

    const response = await request(url_base)
      .post("reviews")
      .send(new_review)
      .set("Content-Type", "application/json");
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("author");
  });

  it("update, should update a review", async () => {
    const fields_to_update = {
        "author": "Play 9",
        "img": "sadsas"
    };

    const response = await request(url_base)
      .put(`reviews/9`)
      .send(fields_to_update);
    expect(response.status).toBe(200);
  });
  */
});