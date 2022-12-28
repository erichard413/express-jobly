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

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /technologies */

describe("GET /technologies", function() {
    test("works - gets all technologies", async()=>{
        const result = await request(app).get("/technologies")
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({technologies: expect.any(Array)});
    })
})

/************************************** POST /technologies */
describe("POST /technologies", function(){
    test("works - admin can create technology", async()=>{
        const result = await request(app).post("/technologies")
        .send({technology: 'testme', username: 'u2'}).set('Authorization', `Bearer ${admToken}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({added: expect.any(Object)});
    })
    test("non admins can't create technology", async()=>{
        try {
            const result = await request(app).post("/technologies")
            .send({technology: 'testme', username: 'u2'}).set('Authorization', `Bearer ${u1Token}`);
        } catch(e) {
            expect(e.statusCode).toBe(401);
        }
    })
})

/************************************** GET /technologies/job/:id */
describe("GET /technologies/job/:id", function(){
    test("works - can get techs for job", async()=>{
        let id = await db.query(`SELECT id FROM jobs WHERE company_handle='c1'`);
        let jobId = id.rows[0].id;
        const result = await request(app).get(`/technologies/job/${jobId}`).set("Authorization", `Bearer ${admToken}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({technologies: ["testing"]});
    })
})

/************************************** GET /technologies/user/:username */
describe("GET /technologies/user/:username", function() {
    test("works - admin can get technologies for a user", async()=>{
        const result = await request(app).get(`/technologies/user/u1`).set("Authorization", `Bearer ${admToken}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({technologies: ["testing"]});
    })
    test("works - user can get their own technologies", async()=>{
        const result = await request(app).get(`/technologies/user/u1`).set("Authorization", `Bearer ${u1Token}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({technologies: ["testing"]});
    })
    test("user can't get other user's tech", async()=>{
        try {
            const result = await request(app).get(`/technologies/user/u2`).set("Authorization", `Bearer ${u1Token}`);
        } catch(e) {
            expect(e.statusCode).toBe(401);
        }
    })
    test("not logged in user can't see tech", async()=>{
        try {
            const result = await request(app).get(`/technologies/user/u2`);
        } catch(e) {
            expect(e.statusCode).toBe(401);
        }
    })
})

/************************************** GET /technologies/jobsby/:technology */
describe("GET /technologies/jobsby/:technology", function() {
    test("works - gets jobs by technology", async()=>{
        const result = await request(app).get(`/technologies/jobsby/testing`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({jobs: expect.any(Array)});
    })
})

/************************************** GET /technologies/jobsfor/:username */
describe("GET /jobsfor/:username", function(){
    test("works - admin can retrieve jobs that match users' tech list", async()=>{
        const result = await request(app).get(`/technologies/jobsfor/u1`).set("Authorization", `Bearer ${admToken}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({jobs: expect.any(Array)});
    })
    test("works - user can retrieve their jobs by tech list", async()=>{
        const result = await request(app).get(`/technologies/jobsfor/u1`).set("Authorization", `Bearer ${u1Token}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({jobs: expect.any(Array)});
    })
    test("user cannot retrieve another user's list", async()=>{
        try {
            const result = await request(app).get(`/technologies/jobsfor/u2`).set("Authorization", `Bearer ${u1Token}`);
        } catch(e) {
            expect(e.statusCode).toBe(401);
        }
    })
    test("non-user cannot retrieve another user's list", async()=>{
        try {
            const result = await request(app).get(`/technologies/jobsfor/u2`);
        } catch(e) {
            expect(e.statusCode).toBe(401);
        }
    })
})

