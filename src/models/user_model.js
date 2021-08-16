const { Model } = require("./../lib/mysql_db_connection");

class UserModel extends Model {
  constructor() {
    super();
    this.tableName = "user";
  }
}

module.exports = new UserModel();
