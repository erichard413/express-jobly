"use strict";

const { user } = require("pg/lib/defaults.js");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);
  
  /************************************** create */

  describe("create", function() {
    const newJob = {
        title: "tester2",
        salary: 2,
        equity: "0.02",
        company_handle: "c2"
    }
    test("works", async function() {
        let job = await Job.create(newJob);
        newJob.id = job.id;
        expect(job).toEqual(newJob);
    });
    test("fails with invalid data", async function() {
        try {
            const badJob ={
                title: "bad",
                salary: "ONE MILLION DOLLARS, cash",
                equity: 1,
                company_handle: "c2"
            }
            let job = await Job.create(badJob);
        } catch (e) {
            expect(e);
        }
    });
  });
  /************************************** findAll */

  describe("findAll", function(){
    test("works: find all jobs", async function(){
        let jobs = await Job.findAll();
        expect(jobs).toEqual(
            [{
                id: expect.any(Number),
                title: 'tester',
                salary: 1,
                equity: "0.01",
                company_handle: 'c1'
            }]
        )
    })
  });
    /************************************** get By Id */
    
  describe("get by Id", ()=>{
    test("works: retrieve single job by ID", async()=>{
        let id = await db.query(`SELECT id FROM jobs WHERE company_handle='c1'`);
        let job = await Job.get(id.rows[0].id);
        expect(job).toEqual(
            {
                id: expect.any(Number),
                title: 'tester',
                salary: 1,
                equity: "0.01",
                company_handle: 'c1'
            }
        )
    });
    test("Fail: error when invalid ID", async()=>{
        try {
            let job = await Job.get(0);
        } catch(e) {
            expect(e.status).toBe(404);
        }
    })
  });

    /************************************** update By Id */
  describe("update job by id", ()=>{
    test("works: updated job with ID", async()=>{
            let id = await db.query(`SELECT id FROM jobs WHERE company_handle='c1'`);
            const result = await Job.update(id.rows[0].id, {title : "testy"})
            expect(result.title).toEqual("testy");
    });
    test("fail: updated job with invalid ID", async()=>{
        try {
            await Job.update(0, {title : "testy"})
        } catch(e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }  
    });
  })

    /************************************** delete By Id */
  describe("delete job by id", ()=>{
    test("works: delete job with ID", async()=>{
        let id = await db.query(`SELECT id FROM jobs WHERE company_handle='c1'`);
        await Job.remove(id.rows[0].id);
        let result = await db.query(`SELECT id FROM jobs WHERE company_handle='c1'`)
        expect(result.rows.length).toEqual(0);
    })
    test("fail: when deleting job with invalid ID", async()=>{
        try {
            await Job.remove(0);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    })
  })