"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  admToken,
} = require("./_testCommon");
const { BadRequestError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
      title: "newjobby",
      salary: 1,
      equity:0.5,
      company_handle: "c1"
    };
    const badJob = {
        title: "badJobby",
        salary: "lol",
        equity: "lol",
        company_handle: "lol"
      };
    // TEST FOR ADMIN USERS:
    test("ok for admin users", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${admToken}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body.job.title).toEqual(newJob.title);
      expect(resp.body.job.salary).toEqual(newJob.salary);
      expect(resp.body.job.company_handle).toEqual(newJob.company_handle);
    });
    test("fails validation with bad info", async function(){
        try {
            const resp = await request(app)
            .post("/jobs")
            .send(badJob)
            .set("authorization", `Bearer ${admToken}`);
        } catch(e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    })
    // TEST for non-admin
    test("error when not admin user", async function() {
        try {
            const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        } catch(e) {
            expect(e.status).toBe(401);
        }

    })    
    test("error when no logged in user", async function(){
        try{
            await request(app).post("/jobs").send(newJob);
        } catch(e) {
            expect(e.status).toBe(401);
        }
    })
});

/************************************** GET /jobs */

describe("GET /jobs", function(){
    test("Get / should show list of jobs", async function(){
        const results = await request(app).get("/jobs");
        expect(results.body.jobs.length).toEqual(3);
        expect(results.body.jobs[0].title).toEqual("j1")
        expect(results.statusCode).toBe(200);
    })
})

/************************************** GET /jobs/id */

describe("GET /jobs/id", function(){
    test("Get /id should show single job", async function() {
        const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
        const id = getId.rows[0].id
        const results = await request(app).get(`/jobs/${id}`);
        expect(results.body.job.id).toEqual(id);
        expect(results.statusCode).toBe(200);
    })
})

/************************************** PATCH /jobs/id */

describe("PATCH --Admin-- /jobs/id", function(){
    test("Admin - should update job with id", async ()=>{
        const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
        const id = getId.rows[0].id
        const results = await request(app).patch(`/jobs/${id}`)
            .send({
                title: "newtitle",
                salary: 150,
                equity: .75
            })
            .set("authorization", `Bearer ${admToken}`);
        expect(results.body.job.title).toEqual("newtitle");
        expect(results.body.job.salary).toEqual(150);
        expect(results.body.job.equity).toEqual("0.75");
        expect(results.statusCode).toBe(200);
    });
    test("Admin - error when bad data", async ()=>{
        try {
            const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
            const id = getId.rows[0].id
            const results = await request(app).patch(`/jobs/${id}`)
                .send({
                title: 24525,
                salary: "A MILLION DOLLARS",
            })
            .set("authorization", `Bearer ${admToken}`);
        } catch(e) {
            expect(e.status).toBe(400);
        }
    });
    test("Admin - error when no data", async()=>{
        try {
            const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
            const id = getId.rows[0].id
            const results = await request(app).patch(`/jobs/${id}`)
            .set("authorization", `Bearer ${admToken}`);
        } catch(e) {
            expect(e.status).toBe(400);
        }
    })
});

describe("/PATCH --non-admin-- /jobs/id", ()=>{
    test("non-admin error received", async()=>{
        try {
            const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
            const id = getId.rows[0].id
            const results = await request(app).patch(`/jobs/${id}`)
                .send({
                title: "newtitle",
                salary: 150
            })
            .set("authorization", `Bearer ${u1Token}`);
        } catch(e) {
            expect(e.status).toBe(400);
        }
    })
});
describe("/PATCH --no user-- /jobs/id", ()=>{
    test("error received", async()=>{
        try {
            const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
            const id = getId.rows[0].id
            const results = await request(app).patch(`/jobs/${id}`)
                .send({
                title: "newtitle",
                salary: 150
            })
        } catch(e) {
            expect(e.status).toBe(400);
        }
    })
});

/************************************** DELETE /jobs/id */

describe("/DELETE --admin user-- /jobs/id", ()=>{
    test("Admin can delete users", async()=>{
        const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
        const id = getId.rows[0].id
        await request(app).delete(`/jobs/${id}`).set("authorization", `Bearer ${admToken}`);;

        const result = await db.query(`SELECT id FROM jobs`);
        expect(result.rows.length).toEqual(2) //we had three test jobs, deleted one.
    });
    test("Admin - receive error on invalid id", async()=>{
        try{
            await request(app).delete(`/jobs/0`);
        } catch(e){
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    })
});

describe("/DELETE --non-admin-- /jobs/id", ()=>{
    test("Non-admins can't delete jobs", async()=>{
        try {
            const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
            const id = getId.rows[0].id
            await request(app).delete(`/jobs/${id}`).set("authorization", `Bearer ${u1Token}`);;
        } catch(e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    })
});
describe("/DELETE --no user-- /jobs/id", ()=>{
    test("Non-admins can't delete jobs", async()=>{
        try {
            const getId = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
            const id = getId.rows[0].id
            await request(app).delete(`/jobs/${id}`);
        } catch(e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    })
});