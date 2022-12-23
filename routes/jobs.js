"use strict";

/** Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

// schemas go here
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");


const router = new express.Router();

/** POST / { job } => { job } 
 *  job should be { title, salary, equity, company_handle }
 * Returns { id, title, salary, equity, company_handle }
 * authorization required: admin
*/

router.post("/", ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    } catch (err) {
        return next(err);
    }
});

/** GET / =>
 *  { jobs: [{id, title, salary, equity, company_handle}, ...] }
 *  authorizaiton required: none
 */

router.get("/", async function(req, res, next) {
    try {
        const jobs = await Job.findAll();
        return res.json({ jobs });
    } catch(e) {
        return next(e);
    }
});

/** Get /[id] => {job}
 *  Authorization required: none
 */

router.get("/:id", async function(req, res, next){
    try {
        const job = await Job.get(req.params.id);
        return res.json({job});
    } catch(e) {
        return next(e);
    }
})

/** PATCH /[id] => { job } 
 * 
 * fields can be { title, salary, equity }
 * 
 * Authorization required: admin
*/ 

router.patch("/:id", ensureAdmin, async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch(e) {
        return next(e);
    }
})

/** DELETE /[id] => {deleted: id}
 * 
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function(req,res,next){
    try {
        await Job.remove(req.params.id);
        return res.json({deleted: req.params.id});
    } catch(e) {
        return next(e);
    }
})


module.exports = router;