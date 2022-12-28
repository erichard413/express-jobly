"use strict";

const db = require("../db");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");


/** Related functions for technologies. */

class Tech {
    static async getAll() {
        const result = await db.query(`SELECT technology, job_id, username FROM technologies`);
        return result.rows;
    }
    static async create(technology, job_id=null, username=null) {
        // prep the SQL query & params array.
        const params = [ technology ];
        let cols = `(technology`
        let values = `($1`
        let valIdx = 2;
        if (job_id !== null) {
            cols += `, job_id`
            params.push(job_id);
            values += `, $${valIdx}`
            valIdx++;
        }
        if (username !== null) {
            cols += `, username`
            params.push(username);
            values += `, $${valIdx}`
            valIdx++;
        }
        cols += `)`
        values += `)`
        const queryString = `INSERT INTO technologies ${cols} VALUES ${values} RETURNING technology, job_id, username`
        
        const results = await db.query(queryString, params);
        return results.rows
    }
    /** get technologies for a single job */
    static async getTechForJob(job_id) {
        const result = await db.query(`SELECT technology FROM technologies WHERE job_id=$1`, [job_id]);
        if (result.rows.length === 0) {
            throw new NotFoundError(`No job id of ${job_id}`, 404);
        }
        return result.rows.map(r => r.technology)
    }
    /** get technologies for a particular user */
    static async getTechForUser(username) {
        const result = await db.query(`SELECT technology FROM technologies WHERE username=$1`, [username]);
        if (result.rows.length === 0) {
            throw new NotFoundError(`No user of ${username}`);
        }
        return result.rows.map(r => r.technology)
    }
    /** get jobs where technology = technology */
    static async getJobsByTech(technology) {
        let tech = technology.toLowerCase()
        const result = await db.query(`SELECT id, title, salary, equity, company_handle FROM jobs LEFT JOIN technologies ON jobs.id = technologies.job_id WHERE LOWER(technology)=$1`, [tech]);
        return result.rows;
    }
    /** get jobs that match user's technologies */
    static async getJobsForUser(username) {
        let user = username.toLowerCase();
        const usercheck = await db.query(`SELECT username FROM users WHERE username=$1`, [user]);
        if (usercheck.rows.length == 0) {
            throw new NotFoundError(`User not found ${user}`, 404);
        }
            const result = await db.query(`SELECT t.technology, id, title, salary, equity, company_handle FROM jobs 
            LEFT JOIN technologies AS t ON jobs.id = t.job_id
            LEFT JOIN (SELECT technology FROM technologies AS t
            WHERE t.username=$1) AS utechs ON utechs.technology = t.technology
            WHERE t.technology = utechs.technology`, [user]);
            return result.rows;
    }
}

module.exports = Tech;