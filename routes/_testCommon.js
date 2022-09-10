"use strict";

const db = require("../db.js");
const User = require("../models/user");
const BuddyRead = require("../models/buddyread");
const BuddyReadStat = require("../models/buddyreadstat");
const Post = require("../models/post");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM buddyreads");
    await db.query("DELETE FROM buddyreadstats");
    await db.query("DELETE FROM posts");
    

    await User.register({
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
    });
    await User.register({
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        password: "password2",
        isAdmin: true,
    });
    await User.register({
        firstName: "U3F",
        lastName: "U3L",
        email: "user3@user.com",
        password: "password3",
        isAdmin: false,
    });
    await db.query(`UPDATE users SET id = 1 WHERE email = 'user1@user.com'`);
    await db.query(`UPDATE users SET id = 2 WHERE email = 'user2@user.com'`);
    await db.query(`UPDATE users SET id = 3 WHERE email = 'user3@user.com'`);


    await BuddyRead.create({
        bookId: 'book1',
        bookTitle: 'booktitle 1', 
        createdBy: 1, 
        buddy: 2, 
        status: 'pending'
    });
    await BuddyRead.create({
        bookId: 'book2', 
        bookTitle: 'booktitle 2', 
        createdBy: 1, 
        buddy: 3, 
        status: 'accepted'
    });
    await BuddyRead.create({
        bookId: 'book3', 
        bookTitle: 'booktitle 3', 
        createdBy: 3, 
        buddy: 2, 
        status: 'rejected'
    });
    await db.query(`UPDATE buddyreads SET id = 1 WHERE book_id = 'book1'`);
    await db.query(`UPDATE buddyreads SET id = 2 WHERE book_id = 'book2'`);
    await db.query(`UPDATE buddyreads SET id = 3 WHERE book_id = 'book3'`);


    await BuddyReadStat.create({
        buddyreadId: 1, 
        userId: 1, 
        progress: 25, 
        rating: null
    });
    await BuddyReadStat.create({
        buddyreadId: 1, 
        userId: 2, 
        progress: 75, 
        rating: null
    });
    await BuddyReadStat.create({
        buddyreadId: 2, 
        userId: 3, 
        progress: 15, 
        rating: null
    });
    await BuddyReadStat.create({
        buddyreadId: 3, 
        userId: 2, 
        progress: 100, 
        rating: 4
    });


    await Post.create({
        buddyreadId: 1, 
        userId: 1, 
        page: 200, 
        message: 'message1', 
        viewed: false, 
        liked: false
    });
    await Post.create({
        buddyreadId: 2, 
        userId: 3, 
        page: 200, 
        message: 'message2', 
        viewed: true, 
        liked: false
    });
    await Post.create({
        buddyreadId: 3, 
        userId: 2, 
        page: 200, 
        message: 'message3', 
        viewed: true, 
        liked: true
    });
    await db.query(`UPDATE posts SET id = 1 WHERE 
                    buddyRead_id = 1 AND 
                    user_id = 1 AND
                    page = 200`);
    await db.query(`UPDATE posts SET id = 2 WHERE 
                    buddyRead_id = 2 AND 
                    user_id = 3 AND
                    page = 200`);
    await db.query(`UPDATE posts SET id = 3 WHERE 
                    buddyRead_id = 3 AND 
                    user_id = 2 AND
                    page = 200`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ id: 1, isAdmin: false });
const u2Token = createToken({ id: 2, isAdmin: true });
const u3Token = createToken({ id: 3, isAdmin: false });



module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token, 
  u3Token
};
