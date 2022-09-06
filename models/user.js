"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with email, password.
   *
   * Returns { id, email, first_name, last_name, profile_picture, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(email, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT id, 
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  profile_picture AS "profilePicture",
                  is_admin AS "isAdmin"
           FROM users
           WHERE email = $1`,
        [email],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, firstName, lastName, email, profilePicture, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { email, password, firstName, lastName, profilePicture, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT email
           FROM users
           WHERE email = $1`,
        [email],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (email,
            password,
            first_name,
            last_name,
            profile_picture,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, first_name AS "firstName", last_name AS "lastName", profile_picture AS "profilePicture", is_admin AS "isAdmin"`,
        [
          email,
          hashedPassword,
          firstName,
          lastName,
          profilePicture,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ id, email, first_name, last_name, profile_picture, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT id, 
                  email,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  profile_picture AS "profilePicture",
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY id`,
    );

    return result.rows;
  }

  /** Given an id, return data about user.
   *
   * Returns { id, email, first_name, last_name, profile_picture, is_admin }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(id) {
    const userRes = await db.query(
          `SELECT id, 
                  email,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  profile_picture AS "profilePicture",
                  is_admin AS "isAdmin"
           FROM users
           WHERE id = $1`,
        [id],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, profilePicture, isAdmin }
   *
   * Returns { firstName, lastName, email, profilPicture, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
    const userIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE id = ${userIdVarIdx} 
                      RETURNING id, 
                                email,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                profile_picture AS "profilePicture",
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, id]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE id = $1
           RETURNING id`,
        [id],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);
  }
}


module.exports = User;