"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");


/** Related functions for buddyreadstats. */

class BuddyReadStat {

  /** Create a new buddyreadstat.
   *
   * Returns { buddyread_id, user_id, progress, rating }
   **/

  static async create({ buddyreadId, userId, progress, rating }) {
    const result = await db.query(
        `INSERT INTO buddyreadstats (
            buddyread_id,
            user_id,
            progress,
            rating
        ) VALUES ($1, $2, $3, $4)
        RETURNING buddyread_id AS "buddyreadId", user_id AS "userId", progress, rating`,
        [buddyreadId, userId, progress, rating]
    );

    return result.rows[0];
  }

  /** Find all buddyreadstats.
   *
   * Returns [{ buddyread_id, user_id, progress, rating }, ...]
   **/

   static async findAll() {
    const result = await db.query(
        `SELECT 
            buddyread_id AS "buddyreadId",
            user_id AS "userId",
            progress,
            rating
        FROM buddyreadstats
        ORDER BY buddyread_id, user_id`,
    );

    return result.rows;
  }

  /** Given a buddyreadId and userId, return data about buddyreadstat.
   *
   * Returns { buddyread_id, user_id, progress, rating }
   *
   * Throws NotFoundError if buddyreadstat not found.
   **/

  static async get(buddyreadId, userId) {
    const buddyReadStatRes = await db.query(
        `SELECT  
            buddyread_id AS "buddyreadId",
            user_id AS "userId",
            progress,
            rating
        FROM buddyreadstats
        WHERE buddyread_id = $1 AND user_id = $2`,
        [buddyreadId, userId],
    );

    const buddyreadstat = buddyReadStatRes.rows[0];

    if (!buddyreadstat) throw new NotFoundError(`No buddyreadstat for buddyread: ${buddyreadId} and user: ${userId}`);

    return buddyreadstat;
  }

  /** Update buddyreadstat data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { progress, rating }
   *
   * Returns { buddyread_id, user_id, progress, rating }
   *
   * Throws NotFoundError if not found.
   */

  static async update(buddyreadId, userId, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          buddyreadId: "buddyread_id",
          userId: "user_id"
        });
    const buddyreadIdVarIdx = "$" + (values.length + 1);
    const userIdVarIdx = "$" + (values.length + 2);


    const querySql = `UPDATE buddyreadstats 
                      SET ${setCols} 
                      WHERE buddyread_id = ${buddyreadIdVarIdx} AND user_id = ${userIdVarIdx} 
                      RETURNING buddyread_id AS "buddyreadId",
                                user_id AS "userId",
                                progress, 
                                rating`;
    const result = await db.query(querySql, [...values, buddyreadId, userId]);
    const buddyreadstat = result.rows[0];

    if (!buddyreadstat) throw new NotFoundError(`No buddyreadstat for buddyread: ${buddyreadId} and user: ${userId}`);

    return buddyreadstat;
  }

  /** Delete given buddyreadstat from database; returns undefined. */

  static async remove(buddyreadId, userId) {
    let result = await db.query(
          `DELETE
           FROM buddyreadstats
           WHERE buddyread_id = $1 AND user_id = $2
           RETURNING buddyread_id, user_id`,
        [buddyreadId, userId],
    );
    const buddyreadstat = result.rows[0];

    if (!buddyreadstat) throw new NotFoundError(`No buddyreadstat for buddyread: ${buddyreadId} and user: ${userId}`);
  }
}


module.exports = BuddyReadStat;