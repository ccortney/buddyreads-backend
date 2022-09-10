"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { email, firstName, lastName, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {email, firstName, lastName, isAdmin} }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: logged in
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const users = await User.findAll(req.query);
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id] => { user }
 *
 * Returns { email, firstName, lastName, isAdmin }
 *
 * Authorization required: logged in
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[id] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:id
 **/

router.patch("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.id, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: admin or same-user-as-:id
 **/

router.delete("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;