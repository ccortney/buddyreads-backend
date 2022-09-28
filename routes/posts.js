"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Post = require("../models/post");
const postNewSchema = require("../schemas/postNew.json");
const postUpdateSchema = require("../schemas/postUpdate.json");


const router = new express.Router();


/** POST / { post }  => { post }
 *
 * Adds a new post. 
 *
 * This returns the newly created post 
 *  {buddyread: { id, buddyreadId, userId, page, message, viewed, liked }
 *
 * Authorization required: ensureLoggedIn
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, postNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const post = await Post.create(req.body);
    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { posts: [ {id, buddyreadId, userId, page, message, viewed, liked}, ... ] }
 *
 * Returns list of all posts.
 *
 * Authorization required: logged in
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const posts = await Post.findAll(req.query);
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});


/** GET /[id] => { post }
 *
 * Returns { id, buddyreadId, userId, page, message, viewed, liked }
 *   where buddyreadId is { id, bookId, bookTitle, createdBy, buddy, status }
 *   where userId is { id, firstName, lastName, email }
 *
 * Authorization required: ensureLoggedIn
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const post  = await Post.get(req.params.id);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[id] { post } => { post }
 *
 * Data can include:
 *   { page, message, viewed, liked }
 *
 * Returns { id, buddyreadId, userId, page, message, viewed, liked }
 *
 * Authorization required: ensureLoggedIn
 **/

router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, postUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const post = await Post.update(req.params.id, req.body);
    return res.json({ post });
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
    await Post.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;