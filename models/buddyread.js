"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");


/** Related functions for buddyreads. */

class BuddyRead {

  /** Create a new buddyread.
   *
   * Returns { id, book_id, created_by, buddy, status }
   **/

  static async create({ bookId, createdBy, buddy, status }) {
    const result = await db.query(
        `INSERT INTO buddyreads (
            book_id,
            created_by,
            buddy,
            status
        ) VALUES ($1, $2, $3, $4)
        RETURNING id, book_id AS "bookId", created_by AS "createdBy", buddy, status`,
        [bookId, createdBy, buddy, status]
    );

    return result.rows[0];
  }

  /** Find all buddyreads.
   *
   * Returns [{ id, book_id, created_by, buddy, status }, ...]
   **/

   static async findAll() {
    const result = await db.query(
          `SELECT id, 
                  book_id AS "bookId",
                  created_by AS "createdBy",
                  buddy,
                  status
           FROM buddyreads
           ORDER BY id`,
    );

    return result.rows;
  }

  /** Given an id, return data about buddyread.
   *
   * Returns { id, book_id, created_by, buddy, status }
   *   where created_by is { id, first_name, last_name, email, profile_picture }
   *   where buddy is { id, first_name, last_name, email, profile_picture }
   *
   * Throws NotFoundError if buddyread not found.
   **/

  static async get(id) {
    const buddyReadRes = await db.query(
        `SELECT id, 
            book_id AS "bookId",
            created_by AS "createdBy",
            buddy,
            status
        FROM buddyreads
        WHERE id = $1`,
        [id],
    );

    const buddyread = buddyReadRes.rows[0];

    if (!buddyread) throw new NotFoundError(`No buddyread: ${id}`);

    const createdByRes = await db.query(
        `SELECT
            u.id,
            u.email,
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            u.profile_picture AS "profilePicture"
        FROM buddyreads AS br
        INNER JOIN users AS u
        ON br.created_by = u.id
        WHERE br.created_by = $1`, [buddyread.createdBy]);

    buddyread.createdBy = createdByRes.rows[0]

    const buddyRes = await db.query(
        `SELECT
            u.id,
            u.email,
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            u.profile_picture AS "profilePicture"
        FROM buddyreads AS br
        INNER JOIN users AS u
        ON br.buddy = u.id
        WHERE br.buddy = $1`, [buddyread.buddy]);

    buddyread.buddy = buddyRes.rows[0]

    return buddyread;
  }

  /** Update buddyread data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { status }
   *
   * Returns { id, book_id, created_by, buddy, status }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          bookId: "book_id",
          createdBy: "created_by"
        });
    const userIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE buddyreads 
                      SET ${setCols} 
                      WHERE id = ${userIdVarIdx} 
                      RETURNING id, 
                                book_id AS "bookId",
                                created_by AS "createdBy",
                                buddy, 
                                status`;
    const result = await db.query(querySql, [...values, id]);
    const buddyread = result.rows[0];

    if (!buddyread) throw new NotFoundError(`No buddyread: ${id}`);

    return buddyread;
  }

  /** Delete given buddyread from database; returns undefined. */

  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM buddyreads
           WHERE id = $1
           RETURNING id`,
        [id],
    );
    const buddyread = result.rows[0];

    if (!buddyread) throw new NotFoundError(`No buddyread: ${id}`);
  }
}


module.exports = BuddyRead;