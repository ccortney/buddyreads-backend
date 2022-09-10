const { BadRequestError } = require("../expressError");

/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names,
 *   like { firstName: "first_name", age: "age" }
 *
 * @returns {Object} {sqlSetCols, dataToUpdate}
 *
 * @example {firstName: 'Aliya', age: 32} =>
 *   { setCols: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32] }
 */

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

function sqlForFilter(criteria) {
  const keys = Object.keys(criteria);

  if (keys.length === 0) throw new BadRequestError("No filtering criteria");
  
  const criteriaStr = [];
  const values = [];


  let idx = 1;
  if (criteria.buddy) {
    criteriaStr.push(`buddy=$${idx}`);
    idx++;
    values.push(+criteria.buddy);
  }

  if (criteria.createdBy) {
    criteriaStr.push(`created_by=$${idx}`);
    idx++;
    values.push(+criteria.createdBy);
  }

  if (criteria.email) {
    criteriaStr.push(`email=$${idx}`);
    idx++;
    values.push(criteria.email);

  }

  if (criteria.buddy && criteria.createdBy) {
    return {
      whereStr: criteriaStr.join(" AND "), values
    }
  } else {
    return {
      whereStr: criteriaStr, values
    }
  }
}

module.exports = { sqlForPartialUpdate, sqlForFilter };