module.exports.database = {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'localdb',
    decimalNumbers: true
  },
  pool: {
    min: 1,
    max: 5
  }
};
