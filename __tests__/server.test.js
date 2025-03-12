const request = require("supertest");
const express = require("express");
const server = require("../server");

const app = express();
app.use(express.json());
app.use("/", server);

describe("Server Module", () => {
  test("GET /status should return 200 and valid JSON", async () => {
    const res = await request(app).get("/status");
    expect(res.statusCode).toBe(200);
    expect(() => JSON.parse(res.text)).not.toThrow();
  });

  test("GET / should return 200 and expected text", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("valheim-server-status");
  });

  // Add more tests as needed
});
