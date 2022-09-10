"use strict";

const {
  NotFoundError,
  BadRequestError
} = require("../expressError");
const db = require("../db.js");
const BuddyRead = require("./buddyread.js");
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
    const newBuddyRead = {
        bookId: 'newBook',
        bookTitle: 'newBookTitle',
        createdBy: 1, 
        buddy: 2, 
        status: 'rejected'
    };

    test("works", async function () {
        let buddyread = await BuddyRead.create(newBuddyRead);
        expect(buddyread).toEqual({...newBuddyRead, id: expect.any(Number)});
        const found = await db.query(`
            SELECT * FROM buddyreads 
            WHERE book_id = 'newBook' AND created_by = 1 AND buddy = 2`);
        expect(found.rows.length).toEqual(1);
    });

    test("bad request with dup data", async function () {
      try {
      await BuddyRead.create(newBuddyRead);
      await BuddyRead.create(newBuddyRead);
      fail();
      } catch (err) {
      expect(err).toBeTruthy();
      }
  });
});

 /************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const buddyreads = await BuddyRead.findAll();
    expect(buddyreads).toEqual([
      {
        id: 1, 
        bookId: 'book1',
        bookTitle: 'booktitle 1', 
        createdBy: {
          id: 1, 
          firstName: 'U1F', 
          lastName: 'U1L'
        }, 
        buddy: {
          id: 2, 
          firstName: 'U2F', 
          lastName: 'U2L'
        },  
        status: 'pending'
      },
      {
        id: 2, 
        bookId: 'book2',
        bookTitle: 'booktitle 2', 
        createdBy: {
          id: 2, 
          firstName: 'U2F', 
          lastName: 'U2L'
        }, 
        buddy: {
          id: 1, 
          firstName: 'U1F', 
          lastName: 'U1L'
        }, 
        status: 'accepted'
      },
    ]);
  });
});

 /************************************** get */


describe("get", function () {
  test("works", async function () {
    let buddyread = await BuddyRead.get(1);
    expect(buddyread).toEqual({
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
    });
  });

  test("not found if no such buddyread", async function () {
    try {
      await BuddyRead.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    status: 'pending'
  };

  test("works", async function () {

    let buddyread = await BuddyRead.update(1, updateData);
    expect(buddyread).toEqual({
        id: 1, 
        bookId: 'book1', 
        bookTitle: 'booktitle 1',
        createdBy: 1, 
        buddy: 2, 
        ...updateData
    });
  });

  test("not found if no such buddyread", async function () {
    try {
      await BuddyRead.update(0, {
        status: 'pending'
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    try {
        await BuddyRead.update(1, {});
        fail();
        } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request if updating restricted fields", async function () {
    try {
        await BuddyRead.update(1, {
          id: 5
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
    await BuddyRead.remove(1);
    const res = await db.query(
        "SELECT * FROM buddyreads WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such buddyread", async function () {
    try {
      await BuddyRead.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
