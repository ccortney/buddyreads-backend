"use strict";

/** Routes for buddyreads. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const BuddyRead = require("../models/buddyread");
const buddyReadsNewSchema = require("../schemas/buddyReadsNew.json");
const buddyReadsUpdateSchema = require("../schemas/buddyReadsUpdate.json");


const router = new express.Router();


/** POST / { buddyread }  => { buddyread }
 *
 * Adds a new buddyread. 
 *
 * This returns the newly created buddyread 
 *  {buddyread: { id, bookId, createdBy, buddy, status }
 *
 * Authorization required: ensureLoggedIn
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, buddyReadsNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const buddyread = await BuddyRead.create(req.body);
    return res.status(201).json({ buddyread });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { buddyReads: [ {id, bookId, createdBy, buddy, status}, ... ] }
 *
 * Returns list of all buddyreads.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const buddyreads = await BuddyRead.findAll();
    return res.json({ buddyreads });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id] => { buddyread }
 *
 * Returns { id, bookId, createdBy, buddy, status }
 *   where createdBy is { id, firstName, lastName, email, profilePicture }
 *   where buddy is { id, firstName, lastName, email, profilePicture }
 *
 * Authorization required: ensureLoggedIn
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const buddyread = await BuddyRead.get(req.params.id);
    return res.json({ buddyread });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[id] { buddyRead } => { buddyRead }
 *
 * Data can include:
 *   { status }
 *
 * Returns { id, bookId, createdBy, buddy, status }
 *
 * Authorization required: ensureLoggedIn
 **/

router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, buddyReadsUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const buddyread = await BuddyRead.update(req.params.id, req.body);
    return res.json({ buddyread });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: ensureLoggedIn
 **/

router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    await BuddyRead.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;