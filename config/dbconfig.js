const sql = require('mssql');
const config = {
    user: 'sa',
    password: '123',
    server: 'localhost',
    database: 'newdtb',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
    sql, pool, poolConnect
};