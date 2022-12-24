"use strict";

const db = require("../db");
const {BadRequestError, NotFoundError, ExpressError} = require("../expressError");
const {sqlForPartialUpdate} = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job from data, update db, return new job data.
     * data should be { title, salary, equity, company_handle }
     * Returns { id, title, salary, equity, company_handle }
     */
    static async create({ title, salary, equity, company_handle }) {
        const result = await db.query(
            `INSERT INTO jobs 
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`, 
            [title, salary, equity, company_handle]
        );
        const job = result.rows[0];
        return job;
    }
    /** show all jobs
     * filter options-> title, minSalary, hasEquity
     * */
    
    // static async findAll() {
    //     const result = await db.query(
    //         `SELECT id, title, salary, equity, company_handle
    //         FROM jobs;
    //         `
    //     )
    //     return result.rows;
    // }

    static async findAll(title=null, minSalary=null, hasEquity=null) {
        // error handler -> making sure our query param does not include multiple filters of the same type.
        let equity;

        if (title != null && (typeof title === 'object')) {
            throw new ExpressError('More than one title received, error!', 400);
        }
        if (minSalary != null && (typeof minSalary === 'object')) {
            throw new ExpressError('More than one minSalary filter received, error!', 400);
        }
        if (hasEquity != null && (typeof hasEquity === 'object')) {
            throw new ExpressError('More than one hasEquity filter received, error!', 400);
        }
        // error handler -> making sure our data is correctly formatted
        if (title != null && !(typeof title ==='string')){
            throw new ExpressError('Title should be a string!',400);
        }
        if (minSalary != null && isNaN(minSalary)) {
            throw new ExpressError('minSalary must be a number!', 400);
        }
        if (hasEquity != null) {
            equity = hasEquity.toLowerCase();
            if (equity !== "true" && equity !== "false") {
                throw new ExpressError('hasEquity must be a boolean', 400);
            }
        }
        // declare QueryString begining, set id & params
        let queryString = `SELECT id, title, salary, equity, company_handle
            FROM jobs
            `
        let idx = 1;
        let params = [];
        if (title || minSalary || equity) {
            queryString += ` WHERE`
        }
        if(title) {
            // convert title string to ILIKE SQL format & add to query string
            let titleLike = `%${title}%`
            params.push(titleLike);
            queryString += ` title ILIKE $${idx}`
            idx++;
        }
        if(minSalary) {
            // add minSalary to queryString
            if (minSalary) {
                if (title) {
                    queryString += ` AND`
                }
            }
            params.push(minSalary);
            queryString += ` salary >=$${idx}`
            idx++;
        }
        if(equity === "true") {
            // add hasEquity to queryString
            if (title || minSalary) {
                queryString += ` AND`
            }
                queryString += ` equity > 0`
                idx++;
        } else if (equity ==="false") {
            if (title || minSalary) {
                queryString += ` AND`
            }
                queryString += ` equity=0 OR null`
                idx++;
        }
        // add final order by to query string, and query the DB
        queryString += ` ORDER BY title`
        console.log(queryString)
        console.log(equity)
        
        const jobsRes = await db.query(queryString, params);
        return jobsRes.rows;
    }

    /** get a single job by id 
    */
    static async get(id) {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id=$1 
            `, [id]
        )
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job with id ${id}`);
        return result.rows[0];
    }

      /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {}
        );
        const idVarIdx = "$" + (values.length +1);

        const querySql = `UPDATE jobs
            SET ${setCols}
            WHERE id=${idVarIdx}
            RETURNING id, title, salary, equity, company_handle
            `
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job with id ${id}`);
        return job;
    }

    /** Delete job with id */

    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM jobs
            WHERE id=$1
            RETURNING id`,
            [id]);
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`No job: ${id}`)
    }
    //** get jobs with company_handle */
    static async companyJobs(handle) {
        const result = await db.query(
            `SELECT id, title, salary, equity FROM jobs WHERE company_handle=$1`, [handle]
        )
        const jobs = result.rows;
        return jobs;
    }
}

module.exports = Job;