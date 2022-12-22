const { BadRequestError } = require("../expressError");

// Parses data received on patch request into array of string data. Will throw "No data" error if no req.body received. Returns object value of SQL strings and indexes.

// Takes (example from user model) argument models as format: 
// ({
//   username, (hashed)password, firstName, lastName, email, isAdmin
// },
// {
//   firstName: "first_name",
//   lastName: "last_name",
//   isAdmin: "is_admin",
// })

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
