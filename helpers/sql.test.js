const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

const jsToSql = {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
}

describe("Testing sqlForPartialUpdate function", () => {
    test("Function outputs user object with first & last name", ()=>{
        const testObj = {firstName:"testfirstname", lastName: "testlastname"}
        const results = sqlForPartialUpdate(testObj, jsToSql);
        expect(results).toEqual({
            setCols: `"first_name"=$1, "last_name"=$2`,
            values: ["testfirstname", "testlastname"],
          })
    }); 
    test("Function outputs user object with email", ()=>{
        const testObj = {email:"test@testmail.com"}
        const results = sqlForPartialUpdate(testObj, jsToSql);
        expect(results).toEqual({
            setCols: `"email"=$1`,
            values: ["test@testmail.com"],
          })
    }); 
    test("When no data is received throw error", ()=>{
        const testObj = {}
        try {
            const results = sqlForPartialUpdate(testObj, jsToSql);
        } catch(e) {
            expect(e.message).toBe("No data");
            expect(e.status).toBe(400);
        }
    }); 
})

