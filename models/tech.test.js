"use strict";

const { user } = require("pg/lib/defaults.js");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Tech = require("./tech.js");

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



    /************************************** get all */
    describe("getAll", function() {
    test("Get all technologies", async()=>{
        const results = await Tech.getAll();
        expect(results).toEqual([{
            technology : 'testing',
            job_id : expect.any(Number),
            username : 'u1'
            }])
        })
    })

    /************************************** create */
    describe("create", function() {
        test("works", async()=>{
            let id = await db.query(`SELECT id FROM jobs WHERE company_handle='c1'`);
            let jobId = id.rows[0].id;
            const results = await Tech.create("testing2", jobId, 'u2');
            expect(results).toEqual([{
                technology: "testing2",
                job_id: jobId,
                username: 'u2'
            }])
        })
    })

    /************************************** get tech for job */
    describe("get tech for job", function(){
        test("works - get tech for job", async()=>{
            let id = await db.query(`SELECT id FROM jobs WHERE company_handle='c1'`);
            let jobId = id.rows[0].id;
            const results = await Tech.getTechForJob(jobId);
            expect(results).toEqual(["testing"]);
        })
        test("error handler - get tech for job", async()=>{
            try {
                let jobId = 0
                const results = await Tech.getTechForJob(jobId);
            } catch(e) {
                expect(e instanceof NotFoundError).toBeTruthy();
            }
        })
    })

    /************************************** get tech for user */
    describe("get tech for user", function() {
        test("works - get tech for user", async()=>{
            const results = await Tech.getTechForUser('u1');
            expect(results).toEqual(['testing']);
        })
        test("error handler - user not found", async()=>{
            try {
                await Tech.getTechForUser('baduser');
            } catch(e) {
                expect(e instanceof NotFoundError).toBeTruthy();
            }
        })
    })

    /************************************** get jobs by technology */
    describe("get jobs by technology", function() {
        test("works - get jobs for technology", async()=>{
            const results = await Tech.getJobsByTech('testing');
            console.log(results);
            expect(results[0].title).toEqual('tester');
            })
    })

    /************************************** get jobs that match user's technologies */
    describe("get jobs that match user technologies", function(){
        test("works - get jobs for user", async()=>{
            const results = await Tech.getJobsForUser('u1');
            expect(results[0].title).toEqual('tester');
        })
    })

