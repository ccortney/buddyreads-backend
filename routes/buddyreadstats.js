"use strict";

/** Routes for buddyreadstats. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const BuddyReadStat = require("../models/buddyreadstat");
const buddyreadStatsNewSchema = require("../schemas/buddyreadStatsNew.json");
const buddyreadStatsUpdateSchema = require("../schemas/buddyreadStatsUpdate.json");


const router = new express.Router();


/** POST / { buddyreadstat }  => { buddyreadstat }
 *
 * Adds a new buddyreadstat. 
 *
 * This returns the newly created buddyreadstat
 *  {buddyreadstat: { buddyreadId, userId, progress, rating}
 *
 * Authorization required: ensureLoggedIn
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, buddyreadStatsNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const buddyreadstat = await BuddyReadStat.create(req.body);
    return res.status(201).json({ buddyreadstat });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { buddyReadstats: [ { buddyreadId, userId, progress, rating }, ... ] }
 *
 * Returns list of all buddyreadstats.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const buddyreadstats = await BuddyReadStat.findAll();
    return res.json({ buddyreadstats });
  } catch (err) {
    return next(err);
  }
});


/** GET /[buddyreadId, userId] => { buddyreadstat }
 *
 * Returns { buddyreadId, userId, progress, rating }
 *   where buddyreadId is { id, bookId, bookTitle, createdBy, buddy, status }
 *   where userId is { id, firstName, lastName, email }
 *
 * Authorization required: ensureCorrectUserOrAdmin
 **/

router.get("/:buddyreadId/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const buddyreadstat = await BuddyReadStat.get(req.params.buddyreadId, req.params.id, );
    return res.json({ buddyreadstat });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[buddyreadId, userId] { buddyreadstat } => { buddyreadstat }
 *
 * Data can include:
 *   { progress, rating }
 *
 * Returns { buddyreadId, userId, progress, rating }
 *
 * Authorization required: ensureCorrectUserOrAdmin
 **/

router.patch("/:buddyreadId/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, buddyreadStatsUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const buddyreadstat = await BuddyReadStat.update(req.params.buddyreadId, req.params.id, req.body);
    return res.json({ buddyreadstat });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[buddyreadId, userId]  =>  { deleted: userId, buddyreadId }
 *
 * Authorization required: ensureCorrectUserOrAdmin
 **/

router.delete("/:buddyreadId/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await BuddyReadStat.remove(req.params.buddyreadId, req.params.id, );
    return res.json({ deleted: `user: ${req.params.id} buddyread: ${req.params.buddyreadId}` });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;