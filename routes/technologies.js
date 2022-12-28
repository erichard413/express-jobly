"use strict";

/** Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin, ensureAdminOrUser } = require("../middleware/auth");
const Job = require("../models/job");
const Tech = require("../models/tech");

// schemas go here
const jobNewSchema = require("../schemas/technologyNew.json");

const router = new express.Router();

/** GET / =>
 *  { technologies: [] }
 *  authorizaton required: none
 */

router.get("/", async function(req, res, next) {
    const result = await Tech.getAll();
    return res.json({technologies: result});
})

/** POST / => adds technology to DB and returns result.
 * input must include json object with technology and optional job_id & username 
 * 
 * Authorization: admin
 */

router.post("/", ensureAdmin, async function(req, res, next) {
    const { technology, job_id, username } = req.body;
    const result = await Tech.create(technology, job_id, username);
    return res.json({added: result});
})

/** GET /job/id => displays technologies listed for job
 *  authroization: none;
 */

router.get("/job/:id", async function(req, res, next) {
    try {
        const { id } = req.params;
        const result = await Tech.getTechForJob(id);
        return res.json({technologies : result})
    } catch(e) {
        return next(e);
    }

})

router.get("/user/:username", ensureAdminOrUser, async function(req, res, next) {
    try {
        const { username } = req.params;
        const result = await Tech.getTechForUser(username);
        return res.json({technologies : result});
    } catch(e) {
        return next(e);
    }
})
/** get jobs by technology 
 *  authorization: none;
  */
router.get("/jobsby/:technology", async function(req, res, next) {
    try {
        const { technology } = req.params;
        const result = await Tech.getJobsByTech(technology);
        return res.json({jobs: result});
    } catch(e) {
        return next(e);
    }
})

/** Get all jobs for user that match their technologies list 
 * authorization: admin or that user
*/
router.get("/jobsfor/:username", ensureAdminOrUser, async function(req, res, next) {
    try {
        const { username } = req.params;
        console.log(username);
        const result = await Tech.getJobsForUser(username);
        console.log(result);
        return res.json({jobs: result});
    } catch(e) {
        return next(e);
    }
})

module.exports = router;