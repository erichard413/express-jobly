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
    /** show all jobs */
    static async findAll() {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs;
            `
        )
        return result.rows;
    }
    /** get a single job by id */
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
}

module.exports = Job;