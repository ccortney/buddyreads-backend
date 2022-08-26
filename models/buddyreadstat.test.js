"use strict";

const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const db = require("../db.js");
const BuddyReadStat = require("./buddyreadstat.js");
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
    const newBuddyReadStat = {
        buddyreadId: 2, 
        userId: 1, 
        progress: 99
    };

    test("works", async function () {
        let buddyreadstat = await BuddyReadStat.create(newBuddyReadStat);
        expect(buddyreadstat).toEqual(buddyreadstat);
        const found = await db.query(`
            SELECT * FROM buddyreadstats 
            WHERE buddyread_id = 2 AND user_id = 1`);
        expect(found.rows.length).toEqual(1);
    });

    test("bad request with dup data", async function () {
        try {
        await BuddyReadStat.create(newBuddyReadStat);
        await BuddyReadStat.create(newBuddyReadStat);
        fail();
        } catch (err) {
        expect(err).toBeTruthy();
        }
    });
});

 /************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const buddyreadstats = await BuddyReadStat.findAll();
    expect(buddyreadstats).toEqual([
      {
        buddyreadId: 1, 
        userId: 1, 
        progress: 35, 
        rating: null
      },
      {
        buddyreadId: 2, 
        userId: 2, 
        progress: 125, 
        rating: 4
      },
    ]);
  });
});

 /************************************** get */


describe("get", function () {
  test("works", async function () {
    let buddyreadstat = await BuddyReadStat.get(1, 1);
    expect(buddyreadstat).toEqual({
        buddyreadId: 1, 
        userId: 1, 
        progress: 35, 
        rating: null
    });
  });

  test("not found if no such buddyread", async function () {
    try {
      await BuddyReadStat.get(0, 1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
      await BuddyReadStat.get(1, 0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    progress: 75, 
    rating: 2
  };

  test("works", async function () {

    let buddyreadstat = await BuddyReadStat.update(1, 1, updateData);
    expect(buddyreadstat).toEqual({
        buddyreadId: 1, 
        userId: 1, 
        ...updateData
    });
  });

  test("not found if no such buddyread", async function () {
    try {
        await BuddyReadStat.update(0, 1, updateData);
        fail();
    } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
        await BuddyReadStat.update(1, 0, updateData);
        fail();
    } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
        await BuddyReadStat.update(1, 1, {});
        fail();
        } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request if updating restricted fields", async function () {
    try {
        await BuddyReadStat.update(1, {
          userId: 50
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
    await BuddyReadStat.remove(1, 1);
    const res = await db.query(
        "SELECT * FROM buddyreadstats WHERE buddyread_id = 1 AND user_id = 1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such buddyread", async function () {
    try {
      await BuddyReadStat.remove(0, 1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
      await BuddyReadStat.remove(1, 0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});