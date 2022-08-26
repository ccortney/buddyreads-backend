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
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /posts */

describe("POST /posts", function () {
    test("works for logged in users", async function () {
      const resp = await request(app)
          .post("/posts")
          .send({
            buddyreadId: 1, 
            userId: 1, 
            page: 80,
            message: "message", 
            viewed: false, 
            liked: false
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        post: {
          id: expect.any(Number),
          buddyreadId: 1, 
          userId: 1, 
          page: 80,
          message: "message", 
          viewed: false, 
          liked: false
        }
      });
    });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/posts")
        .send({
            buddyreadId: 1, 
            userId: 1, 
            page: 80,
            message: "message", 
            viewed: false, 
            liked: false
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/posts")
        .send({
            buddyreadId: 1
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/posts")
        .send({
            buddyreadId: 1, 
            userId: 1, 
            page: 80,
            message: 2, 
            viewed: false, 
            liked: false
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /posts */

describe("GET /posts", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .get("/posts")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      posts: [
        {
            id: 1, 
            buddyreadId: 1, 
            userId: 1, 
            page: 200, 
            message: 'message1', 
            viewed: false, 
            liked: false
        },
        {
            id: 2, 
            buddyreadId: 2, 
            userId: 3, 
            page: 200, 
            message: 'message2', 
            viewed: true, 
            liked: false
        },
        {
            id: 3, 
            buddyreadId: 3, 
            userId: 2, 
            page: 200, 
            message: 'message3', 
            viewed: true, 
            liked: true
        },
      ],
    });
  });

  test("does not work for users", async function () {
    const resp = await request(app)
        .get("/posts")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/posts");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE posts CASCADE");
    const resp = await request(app)
        .get("/posts")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /posts/:id */

describe("GET /posts/:id", function () {
  test("works for the user", async function () {
    const resp = await request(app)
        .get(`/posts/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      post: {
        id: 1, 
        buddyreadId: {
            id: 1, 
            bookId: 'book1', 
            createdBy: 1, 
            buddy: 2, 
            status: 'pending'
        }, 
        userId: {
            id: 1,
            firstName: "U1F",
            lastName: "U1L",
            email: "user1@user.com"
        }, 
        page: 200, 
        message: 'message1',
        viewed: false, 
        liked: false
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/posts/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if post not found", async function () {
    const resp = await request(app)
        .get(`/posts/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /posts/:id */

describe("PATCH /posts/:id", () => {
  test("works for the user", async function () {
    const resp = await request(app)
        .patch(`/posts/1`)
        .send({
          liked: true,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
        post: {
            id: 1, 
            buddyreadId: 1, 
            userId: 1, 
            page: 200,
            message: "message1", 
            viewed: false, 
            liked: true
      },
    });
  });


  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/posts/1`)
        .send({
            liked: true,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such post", async function () {
    const resp = await request(app)
        .patch(`/posts/0`)
        .send({
            liked: true,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/buddyreads/1`)
        .send({
            liked: "true"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /posts/:id */

describe("DELETE /posts/:id", function () {
  test("works for the user", async function () {
    const resp = await request(app)
        .delete(`/posts/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/posts/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if post missing", async function () {
    const resp = await request(app)
        .delete(`/posts/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});