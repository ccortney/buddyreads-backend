"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

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

/************************************** POST /users */

describe("POST /users", function () {
  test("works for users: create non-admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          email: "new@email.com",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          profilePicture: "http://new.img",
          isAdmin: false,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        email: "new@email.com",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        profilePicture: "http://new.img",
        isAdmin: false,
      }, token: expect.any(String),
    });
  });

  test("works for users: create admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          email: "new@email.com",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          profilePicture: "http://new.img",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number), 
        email: "new@email.com",
        firstName: "First-new",
        lastName: "Last-newL",
        profilePicture: "http://new.img",
        isAdmin: true,
      }, token: expect.any(String),
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          email: "new@email.com",
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          profilePicture: "http://new.img",
          isAdmin: true,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          email: "new@email.com",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          email: "new@email.com",          
          firstName: "First-new",
          lastName: "Last-newL",
          password: "password-new",
          email: "not-an-email",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /users */

describe("GET /users", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      users: [
        {
          id: 1, 
          firstName: "U1F",
          lastName: "U1L",
          email: "user1@user.com",
          profilePicture: "http://u1.img",
          isAdmin: false,
        },
        {
          id: 2, 
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
          profilePicture: "http://u2.img",
          isAdmin: true,
        },
        {
          id: 3, 
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
          profilePicture: "http://u3.img",
          isAdmin: false,
        },
      ],
    });
  });

  test("does not work for users", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /users/:username */

describe("GET /users/:id", function () {
  test("works for the user", async function () {
    const resp = await request(app)
        .get(`/users/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        id: 1, 
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        profilePicture: "http://u1.img",
        isAdmin: false,
        buddyreads: [
          {
            id: 1,
            bookId: 'book1', 
            buddy: 2, 
            status: 'pending'
          }, 
          {
            id: 2,
            bookId: 'book2', 
            buddy: 3, 
            status: 'accepted'
          }
        ], 
        buddyreadstats: [
          {
            buddyreadId: 1, 
            progress: 25, 
            rating: null
          }
        ],
        posts: [
          {
            id: expect.any(Number),
            buddyreadId: 1, 
            page: 200, 
            message: 'message1', 
            viewed: false, 
            liked: false
          }
        ]
      },
    });
  });


  test("works for admin", async function () {
    const resp = await request(app)
        .get(`/users/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      user: {
        id: 1, 
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        profilePicture: "http://u1.img",
        isAdmin: false,
        buddyreads: [
          {
            id: 1,
            bookId: 'book1', 
            buddy: 2, 
            status: 'pending'
          }, 
          {
            id: 2,
            bookId: 'book2', 
            buddy: 3, 
            status: 'accepted'
          }
        ], 
        buddyreadstats: [
          {
            buddyreadId: 1, 
            progress: 25, 
            rating: null
          }
        ],
        posts: [
          {
            id: expect.any(Number),
            buddyreadId: 1, 
            page: 200, 
            message: 'message1', 
            viewed: false, 
            liked: false
          }
        ]
      },
    });
  });

  test("does not work for other users", async function () {
    const resp = await request(app)
        .get(`/users/1`)
        .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/users/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get(`/users/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:id", () => {
  test("works for the user", async function () {
    const resp = await request(app)
        .patch(`/users/1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        profilePicture: "http://u1.img",
        isAdmin: false,
      },
    });
  });

  test("works for the admin", async function () {
    const resp = await request(app)
        .patch(`/users/1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        profilePicture: "http://u1.img",
        isAdmin: false,
      },
    });
  });

  test("does not work for other users", async function () {
    const resp = await request(app)
        .patch(`/users/1`)
        .send({
          firstName: "New",
        })
        .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/users/1`)
        .send({
          firstName: "New",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
        .patch(`/users/0`)
        .send({
          firstName: "Nope",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          firstName: 42,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: set new password", async function () {
    const resp = await request(app)
        .patch(`/users/1`)
        .send({
          password: "new-password",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        profilePicture: "http://u1.img",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("user1@user.com", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:id", function () {
  test("works for the user", async function () {
    const resp = await request(app)
        .delete(`/users/1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/users/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("does not work for other user", async function () {
    const resp = await request(app)
        .delete(`/users/1`)
        .set("authorization", `Bearer ${u3Token}`);
        expect(resp.statusCode).toEqual(401);
    });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/users/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .delete(`/users/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});