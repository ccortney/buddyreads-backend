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

/************************************** POST /buddyreads */

describe("POST /buddyreads", function () {
    test("works for logged in users", async function () {
      const resp = await request(app)
          .post("/buddyreads")
          .send({
            bookId: "new-book", 
            bookTitle: "newbooktitle",
            createdBy: 1, 
            buddy: 2,
            status: "accepted"
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        buddyread: {
          id: expect.any(Number),
          bookId: "new-book", 
          bookTitle: "newbooktitle",
          createdBy: 1, 
          buddy: 2,
          status: "accepted"
        }
      });
    });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/buddyreads")
        .send({
            bookId: "new-book", 
            bookTitle: 'newbooktitle',
            createdBy: 1, 
            buddy: 2,
            status: "accepted"
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/buddyreads")
        .send({
          bookId: "new-book",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/buddyreads")
        .send({
            bookId: 8, 
            bookTitle: 'newbooktitle',
            createdBy: 1, 
            buddy: 2,
            status: "accepted"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /buddyreads */

describe("GET /buddyreads", function () {
  test("works", async function () {
    const resp = await request(app)
        .get("/buddyreads")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      buddyreads: [
        {
            id: 1, 
            bookId: 'book1', 
            bookTitle: 'booktitle 1',
            createdBy: {
              id: 1,
              firstName: "U1F",
              lastName: "U1L",
          },  
            buddy: {
              id: 2,
              firstName: "U2F",
              lastName: "U2L",
          }, 
            status: 'pending'
        },
        {
            id: 2,
            bookId: 'book2', 
            bookTitle: 'booktitle 2',
            createdBy: {
              id: 1,
              firstName: "U1F",
              lastName: "U1L",
          },  
            buddy: {
              id: 3,
              firstName: "U3F",
              lastName: "U3L",
          },  
            status: 'accepted'
        },
        {
            id: 3, 
            bookId: 'book3',
            bookTitle: 'booktitle 3',
            createdBy: {
              id: 3,
              firstName: "U3F",
              lastName: "U3L",
          },  
            buddy: {
              id: 2,
              firstName: "U2F",
              lastName: "U2L",
          },  
            status: 'rejected'
        },
      ],
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/buddyreads");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE buddyreads CASCADE");
    const resp = await request(app)
        .get("/buddyreads")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /buddyreads/:id */

describe("GET /buddyreads/:id", function () {
  test("works for the user", async function () {
    const resp = await request(app)
        .get(`/buddyreads/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      buddyread: {
        id: 1, 
        bookId: 'book1', 
        bookTitle: 'booktitle 1',
        createdBy: {
          id: 1,
          firstName: "U1F",
          lastName: "U1L",
      }, 
        buddy: {
            id: 2,
            firstName: "U2F",
            lastName: "U2L",
        }, 
        status: 'pending'
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/buddyreads/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if buddyread not found", async function () {
    const resp = await request(app)
        .get(`/buddyreads/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /buddyreads/:id */

describe("PATCH /buddyreads/:id", () => {
  test("works for the user", async function () {
    const resp = await request(app)
        .patch(`/buddyreads/1`)
        .send({
          status: "accepted",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      buddyread: {
        id: 1, 
        bookId: 'book1', 
        bookTitle: "booktitle 1",
        createdBy: 1, 
        buddy: 2, 
        status: 'accepted'
      },
    });
  });


  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/buddyreads/1`)
        .send({
          status: "accepted",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such buddyread", async function () {
    const resp = await request(app)
        .patch(`/buddyreads/0`)
        .send({
          status: "accepted",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/buddyreads/1`)
        .send({
          status: 42,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /buddyreads/:id */

describe("DELETE /buddyreads/:id", function () {
  test("works for the user", async function () {
    const resp = await request(app)
        .delete(`/buddyreads/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/buddyreads/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if buddyread missing", async function () {
    const resp = await request(app)
        .delete(`/buddyreads/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});