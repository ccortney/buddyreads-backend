"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token, 
  u3Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /buddyreadstats */

describe("POST /buddyreadstats", function () {
    test("works for logged in users", async function () {
      const resp = await request(app)
            .post("/buddyreadstats")
            .send({
                buddyreadId: 3, 
                userId: 1, 
                progress: 56
            })
            .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
            buddyreadstat: {
                buddyreadId: 3, 
                userId: 1, 
                progress: 56,
                rating: null
            }
      });
    });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/buddyreadstats")
        .send({
            buddyreadId: 3, 
            userId: 1, 
            progress: 56,
            rating: null
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/buddyreadstats")
        .send({
            buddyreadId: 3
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
            buddyreadId: 3, 
            userId: "one", 
            progress: 56,
            rating: null
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /buddyreadstats */

describe("GET /buddyreadstats", function () {
  test("works for logged in users", async function () {
    const resp = await request(app)
        .get("/buddyreadstats")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      buddyreadstats: [
        {
            buddyreadId: 1, 
            userId: 1, 
            progress: 25,
            rating: null
        },
        {
            buddyreadId: 1, 
            userId: 2, 
            progress: 75,
            rating: null
        },
        {
            buddyreadId: 2, 
            userId: 3, 
            progress: 15,
            rating: null
        },
        {
            buddyreadId: 3, 
            userId: 2, 
            progress: 100,
            rating: 4
        }
      ],
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/buddyreadstats");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE buddyreadstats CASCADE");
    const resp = await request(app)
        .get("/buddyreadstats")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /buddyreadstats/:buddyreadId/:id */

describe("GET /buddyreadstats/:buddyreadId/:id", function () {
  test("works for logged in users", async function () {
    const resp = await request(app)
        .get(`/buddyreadstats/1/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      buddyreadstat: {
        buddyreadId: 1, 
        userId: 1, 
        progress: 25,
        rating: null
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/buddyreadstats/1/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if buddyread not found", async function () {
    const resp = await request(app)
        .get(`/buddyreads/0/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get(`/buddyreads/1/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /buddyreadstats/:buddyreadId/:id */

describe("PATCH /buddyreadstats/:buddyreadId/:id", () => {
  test("works for logged in users", async function () {
    const resp = await request(app)
        .patch(`/buddyreadstats/1/1`)
        .send({
          progress: 100, 
          rating: 5
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      buddyreadstat: {
        buddyreadId: 1, 
        userId: 1, 
        progress: 100,
        rating: 5
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/buddyreadstats/1/1`)
        .send({
            progress: 100, 
            rating: 5
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such buddyread", async function () {
    const resp = await request(app)
        .patch(`/buddyreadstats/0/1`)
        .send({
            progress: 100, 
            rating: 5
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
        .patch(`/buddyreadstats/1/0`)
        .send({
            progress: 100, 
            rating: 5
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/buddyreads/1`)
        .send({
            progress: "100"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /buddyreadstats/:buddyreadId/:id */

describe("DELETE /buddyreadstats/:buddyreadId/:id", function () {
  test("works for the user", async function () {
    const resp = await request(app)
        .delete(`/buddyreadstats/1/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "user: 1 buddyread: 1" });
  });

  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/buddyreadstats/1/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "user: 1 buddyread: 1" });
  });
  
  test("does not work for other users", async function () {
    const resp = await request(app)
        .delete(`/buddyreadstats/1/1`)
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/buddyreadstats/1/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if buddyread missing", async function () {
    const resp = await request(app)
        .delete(`/buddyreadstats/0/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .delete(`/buddyreadstats/1/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});