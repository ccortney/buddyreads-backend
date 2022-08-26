"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");


/** Related functions for posts */

class Post {

  /** Create a new post.
   *
   * Returns { id, buddyread_id, user_id, page, message, viewed, liked }
   **/

  static async create({ id, buddyreadId, userId, page, message, viewed, liked  }) {
    const result = await db.query(
        `INSERT INTO posts (
            buddyread_id,
            user_id,
            page,
            message, 
            viewed, 
            liked
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, buddyread_id AS "buddyreadId", user_id AS "userId", page, message, viewed, liked`,
        [buddyreadId, userId, page, message, viewed, liked]
    );

    return result.rows[0];
  }

  /** Find all posts.
   *
   * Returns [{ id, buddyread_id, user_id, page, message, viewed, liked }, ...]
   **/

   static async findAll() {
    const result = await db.query(
        `SELECT
            id,  
            buddyread_id AS "buddyreadId",
            user_id AS "userId",
            page, 
            message, 
            viewed, liked
        FROM posts
        ORDER BY id`,
    );

    return result.rows;
  }

  /** Given a id, return data about post.
   *
   * Returns { id, buddyread_id, user_id, page, message, viewed, liked }
   *    where buddyread_id is { id, book_id, created_by, buddy, status }
   *    where user_id is { id, email, first_name, last_name}

   * 
   * Throws NotFoundError if post not found.
   **/

  static async get(id) {
    const postRes = await db.query(
        `SELECT  
            id,
            buddyread_id AS "buddyreadId",
            user_id AS "userId",
            page, 
            message, 
            viewed,
            liked
        FROM posts
        WHERE id = $1`,
        [id],
    );

    const post = postRes.rows[0];

    if (!post) throw new NotFoundError(`No post: ${id}`);

    const userRes = await db.query(
        `SELECT
            u.id,
            u.email,
            u.first_name AS "firstName",
            u.last_name AS "lastName"
        FROM posts AS p
        INNER JOIN users AS u
        ON p.user_id = u.id
        WHERE p.user_id = $1`, [post.userId]);

    post.userId = userRes.rows[0]

    const buddyReadRes = await db.query(
        `SELECT
            br.id,
            br.book_id AS "bookId",
            br.created_by AS "createdBy",
            br.buddy, 
            br.status
        FROM posts AS p
        INNER JOIN buddyreads AS br
        ON p.buddyread_id = br.id
        WHERE p.buddyread_id = $1`, [post.buddyreadId]);

    post.buddyreadId = buddyReadRes.rows[0]


    return post;
  }

  /** Update post data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { page, message, viewed, liked }
   *
   * Returns { id, buddyread_id, user_id, page, message, viewed, liked }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {

    const { setCols, values } = sqlForPartialUpdate(data, {});
    const postIdVarIdx = "$" + (values.length + 1);


    const querySql = `UPDATE posts 
                      SET ${setCols} 
                      WHERE id = ${postIdVarIdx}
                      RETURNING id, 
                                buddyread_id AS "buddyreadId",
                                user_id AS "userId",
                                page, 
                                message, 
                                viewed,
                                liked`;
    const result = await db.query(querySql, [...values, id]);
    const post = result.rows[0];

    if (!post) throw new NotFoundError(`No post: ${id}`);

    return post;
  }

  /** Delete given post from database; returns undefined. */

  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM posts
           WHERE id = $1
           RETURNING id`,
        [id],
    );
    const post = result.rows[0];

    if (!post) throw new NotFoundError(`No post: ${id}`);
  }
}


module.exports = Post;