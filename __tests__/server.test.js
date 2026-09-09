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

  test("GET /version should return injected build info when GIT_COMMIT is set", async () => {
    const previous = process.env.GIT_COMMIT;
    process.env.GIT_COMMIT = "abc1234";
    process.env.GIT_COMMIT_SUBJECT = "test commit";
    try {
      const res = await request(app).get("/version");
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.text);
      expect(body.hash).toBe("abc1234");
      expect(body.subject).toBe("test commit");
    } finally {
      if (previous === undefined) {
        delete process.env.GIT_COMMIT;
      } else {
        process.env.GIT_COMMIT = previous;
      }
    }
  });

  // Add more tests as needed
});
