import request from "supertest";

const url_base = "http://localhost:8080/api/";

describe("playlist test", () => {
  it("get all, should return a list of playlists", async () => {
    const response = await request(url_base).get("playlists/");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("name");
  });

  it("get one, should return only one playlist", async () => {
    const response = await request(url_base).get("playlists/1");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("name");
    expect(!Array.isArray(response.body.data)).toBe(true);
  });

 /* it("post one playlist, should create a playlist", async () => {
    const new_playlist = {
     name: "Star",
     img: "sadsas"
    };

    const response = await request(url_base)
      .post("playlists")
      .send(new_playlist)
      .set("Content-Type", "application/json");
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("name");
  });

  it("update, should update a playlist", async () => {
    const fields_to_update = {
        "name": "Play 9",
        "img": "sadsas"
    };

    const response = await request(url_base)
      .put(`playlists/9`)
      .send(fields_to_update);
    expect(response.status).toBe(200);
  });
  */
});