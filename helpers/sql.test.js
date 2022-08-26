const db = require("../db");
const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


beforeEach(async function() {
    await db.query("BEGIN");
})
  
afterEach(async function() {
    await db.query("ROLLBACK");
})
  
afterAll(async function() {
    await db.end();
})

describe("sqlForPartialUpdate", function () {
    test("works", function () {
        const dataToUpdate = {firstName: "Aliya", age: 32};
        const jsToSql = {firstName: "first_name"};
        const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(setCols).toEqual(`"first_name"=$1, "age"=$2`)
        expect(values).toEqual(["Aliya", 32])
    });

    test("error if no data", function() {
        try {
            const dataToUpdate = {};
            const jsToSql = {firstName: "first_name"};
            const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql);
            fail();
        } catch(err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })
});