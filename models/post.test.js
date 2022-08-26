"use strict";

const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const db = require("../db.js");
const Post = require("./post.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// /************************************** create */

describe("create", function () {
    const newPost = {
        buddyreadId: 1, 
        userId: 1, 
        page: 50, 
        message: "message",
        viewed: false, 
        liked: false
    };

    test("works", async function () {
        let post = await Post.create(newPost);
        expect(post).toEqual({...newPost, id: expect.any(Number)});
        const found = await db.query(`
            SELECT * FROM posts
            WHERE   buddyread_id = 1 
                    AND user_id = 1 
                    AND page = 50
                    AND message = 'message'`);
        expect(found.rows.length).toEqual(1);
    });

    test("bad request with dup data", async function () {
      try {
      await Post.create(newPost);
      await Post.create(newPost);
      fail();
      } catch (err) {
      expect(err).toBeTruthy();
      }
  });
});

 /************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const posts = await Post.findAll();
    expect(posts).toEqual([
      {
        id: 1,
        buddyreadId: 1, 
        userId: 1, 
        page: 224, 
        message: "message1",
        viewed: true, 
        liked: false
      },
      {
        id: 2,
        buddyreadId: 2, 
        userId: 2, 
        page: 224, 
        message: "message2",
        viewed: false, 
        liked: false
      },
    ]);
  });
});

 /************************************** get */

describe("get", function () {
  test("works", async function () {
    let post = await Post.get(1);
    expect(post).toEqual({
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
            email: "u1@email.com"
        }, 
        page: 224, 
        message: "message1",
        viewed: true, 
        liked: false
    });
  });

  test("not found if no such post", async function () {
    try {
      await Post.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    liked: true
  };

  test("works", async function () {

    let post = await Post.update(1, updateData);
    expect(post).toEqual({
        id: 1,
        buddyreadId: 1, 
        userId: 1, 
        page: 224, 
        message: "message1",
        viewed: true, 
        ...updateData
    });
  });

  test("not found if no such post", async function () {
    try {
      await Post.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
        await Post.update(1, {});
        fail();
        } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request if updating restricted fields", async function () {
    try {
        await Post.update(1, {
          userId: 5
        });
        fail();
        } catch (err) {
        expect(err).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Post.remove(1);
    const res = await db.query(
        "SELECT * FROM posts WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such post", async function () {
    try {
      await Post.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});