"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * 
   * filter options, name, minEmployees, & maxEmployees.
   * */

  static async findAll(name=null, minEmployees=null, maxEmployees=null) {
    // error handler
    // -> conflicted on this typeof name check; the data being passed here will always be string data regardless. If I were to make this check for isNaN(name) and handle it, it would limit the functionality of my app as it is theoretically possible for a company to have a number in its name (ie: Rapid7)
    if (name != null && !(typeof name === 'string')){
      throw new ExpressError("name should be a string!", 400);
    }
    if (minEmployees != null && (isNaN(minEmployees)) || maxEmployees != null && (isNaN(maxEmployees))) {
      throw new ExpressError("minEmployees & maxEmployees must be a number", 400);
    }
    if ((minEmployees && maxEmployees) && minEmployees > maxEmployees) {
      throw new ExpressError("minEmployees value cannot exceed maxEmployees value!", 400);
    }
    // declare queryString beginning, set idx & params
    let queryString = `SELECT handle,
        name,
        description,
        num_employees AS "numEmployees",
        logo_url AS "logoUrl"
        FROM companies`
    let idx = 1;
    let params = [];
    if (name || minEmployees || maxEmployees) {
      queryString += ` WHERE`
    } 
    if(name) {
      // convert name string to ILIKE SQL format & add to query string
      let nameLike = `%${name}%`
      params.push(nameLike);
      queryString += ` name ILIKE $${idx}`
      idx++;
      }
    if (minEmployees) {
      // add minEmployees to query string
      if (name) {
        queryString += ` AND`
      }
      params.push(minEmployees);
      queryString += ` num_employees >= $${idx}`
      idx++;
    }
    if (maxEmployees) {
      // add maxEmployees to query string
      if (name || minEmployees) {
        queryString += ` AND`
      }
      params.push(maxEmployees);
      queryString += ` num_employees <= $${idx}`
      idx++;
    }
    // add final order by to query string, and query the DB.
    queryString += ` ORDER BY name`
    const companiesRes = await db.query(queryString, params);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
