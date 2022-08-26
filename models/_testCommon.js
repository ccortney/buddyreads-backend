const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");



async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM buddyreads");
    await db.query("DELETE FROM buddyreadstats");
    await db.query("DELETE FROM posts");
  
    await db.query(`
        INSERT INTO users(email,
                          password,
                          first_name,
                          last_name,
                          profile_picture)
        VALUES  ('u1@email.com', $1, 'U1F', 'U1L', 'http://u1.img'),
                ('u2@email.com', $2, 'U2F', 'U2L', 'http://u2.img')
        RETURNING id`,
        [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        ]);

    await db.query(`UPDATE users SET id = 1 WHERE email = 'u1@email.com'`)
    await db.query(`UPDATE users SET id = 2 WHERE email = 'u2@email.com'`)

    await db.query(`
        INSERT INTO buddyreads(book_id, created_by, buddy, status)
        VALUES  ('book1', 1, 2, 'pending'),
                ('book2', 2, 1, 'accepted')`);

    await db.query(`UPDATE buddyreads SET id = 1 WHERE book_id = 'book1'`)
    await db.query(`UPDATE buddyreads SET id = 2 WHERE book_id = 'book2'`)   


    await db.query(`
        INSERT INTO buddyreadstats(buddyread_id, user_id, progress, rating)
        VALUES  (1, 1, 35, null),
                (2, 2, 125, 4)`);

    await db.query(`
        INSERT INTO posts(buddyread_id, user_id, page, message, viewed, liked)
        VALUES  (1, 1, 224, 'message1', true, false),
                (2, 2, 224, 'message2', false, false)`);

    await db.query(`UPDATE posts SET id = 1 WHERE message = 'message1'`)
    await db.query(`UPDATE posts SET id = 2 WHERE message = 'message2'`)   
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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};