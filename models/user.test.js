"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
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

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1@email.com", "password1");
    expect(user).toEqual({
      id: 1,
      email: "u1@email.com",
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      isAdmin: false
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("u1@email.com", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    email: "test@test.com",
    firstName: "Test",
    lastName: "Tester",
    isAdmin: false,
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual({...newUser, id: expect.any(Number)});
    const found = await db.query("SELECT * FROM users WHERE email = 'test@test.com'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, isAdmin: true, id: expect.any(Number) });
    const found = await db.query("SELECT * FROM users WHERE email = 'test@test.com'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        email: "u1@email.com",
        firstName: "U1F",
        lastName: "U1L",
        isAdmin: false,
        id: expect.any(Number)
      },
      {
        email: "u2@email.com",
        firstName: "U2F",
        lastName: "U2L",
        isAdmin: false,
        id: expect.any(Number)
      },
    ]);
  });
});

/************************************** get */


describe("get", function () {
  test("works", async function () {
    let user = await User.get("1");
    expect(user).toEqual({
        id: 1, 
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        isAdmin: false
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    firstName: "NewFN",
    lastName: "NewLN",
    email: "new@email.com",
    isAdmin: true,
  };

  test("works", async function () {

    let user = await User.update(1, updateData);
    expect(user).toEqual({
      id: 1,
      ...updateData,
    });
  });

  test("works: set password", async function () {
    let originalUser = await db.query("SELECT * FROM users WHERE id = 1");
    let originalPassword = originalUser.rows[0].password

    let newUser = await User.update(1, {
        password: "new",
    });
    expect(newUser).toEqual({
        id: 1,
        firstName: "U1F",
        lastName: "U1L",
        email: "u1@email.com",
        isAdmin: false,
    });
    const found = await db.query("SELECT * FROM users WHERE id = 1");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password).not.toEqual(originalPassword);
  });

  test("not found if no such user", async function () {
    try {
      await User.update(0, {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
      await User.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request if updating restricted fields", async function () {
    try {
        await User.update(1, {id: 50});
        fail();
        } catch (err) {
        expect(err).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await User.remove(1);
    const res = await db.query(
        "SELECT * FROM users WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

