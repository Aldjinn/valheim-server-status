jest.mock("gamedig", () => ({
  GameDig: {
    query: jest.fn(() =>
      Promise.resolve({
        name: "Mock Server",
        map: "Mock Map",
        players: [],
        raw: { tags: "MockTag" },
      })
    ),
  },
}));

const valheim = require("../valheim");

describe("Valheim Module", () => {
  test("getGamedigResult should return initial value", () => {
    expect(valheim.getGamedigResult()).toBe("No query yet.");
  });

  test("queryServer should update gamedigResult", (done) => {
    valheim.queryServer();
    setTimeout(() => {
      try {
        const result = valheim.getGamedigResult();
        expect(result).toHaveProperty("queryDate");
        expect(result).toHaveProperty("numberOfPlayers", 0);
        expect(result).toHaveProperty("name", "Mock Server");
        done();
      } catch (e) {
        done(e);
      }
    }, 50);
  });
});
