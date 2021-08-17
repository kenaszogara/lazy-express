const {
  multipleColumnSet,
  multipleColumnInsert,
  multipleColumnWhere,
} = require("./utils");
const query = require("./mysql_db_connection");

// tableName is required
class Model {
  constructor() {
    this.tableName;
    this.fields;
  }

  find = async (params = {}) => {
    let sql = `SELECT * FROM ${this.tableName}`;

    if (!Object.keys(params).length) {
      return await query(sql);
    }

    const { columnSet, values } = multipleColumnWhere(params);
    sql += ` WHERE ${columnSet}`;

    return await query(sql, [...values]);
  };

  findWhere = async (params) => {
    let sql = `SELECT * FROM ${this.tableName}`;

    if (!Object.keys(params).length) {
      return await query(sql);
    }

    const { columnSet, values } = multipleColumnWhere(params);
    sql += ` WHERE ${columnSet}`;

    return await query(sql, [...values]).then((row) => {
      return row;
    });
  };

  findById = async (id) => {
    const sql = `SELECT * FROM ${this.tableName}
    WHERE id = ${id}`;

    return query(sql, [id]).then((row) => {
      return row[0];
    });
  };

  create = async (params) => {
    const { columnSet, columnPlaceholder, values } =
      multipleColumnInsert(params);

    const sql = `INSERT INTO ${this.tableName}
    (${columnSet}) VALUES (${columnPlaceholder})`;

    const result = await query(sql, [...values]);

    return result;
  };

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);
    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE id = ?`;
    const result = await query(sql, [...values, id]);

    return result;
  };

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName}
    WHERE id = ?`;
    const result = await query(sql, [id]);

    return result;
  };
}

module.exports = { Model };
