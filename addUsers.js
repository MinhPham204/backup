const bcrypt = require('bcrypt');
const sql = require('mssql');
const dbConfig = require('./config/dbconfig');
const users = require('./users.json'); // Import danh sách tài khoản

async function addUsers() {
    try {
        let pool = await sql.connect(dbConfig);

        for (let user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10); // Hash mật khẩu
            await pool.request()
                .input('username', sql.NVarChar, user.username)
                .input('password', sql.NVarChar, hashedPassword)
                .input('roleId', sql.Int, user.roleId)
                .input('isActive', sql.Bit, user.isActive)
                .query('INSERT INTO Accounts (Username, Password, RoleId, IsActive) VALUES (@username, @password, @roleId, @isActive)');

            console.log(`Đã thêm tài khoản: ${user.username}`);
        }

        console.log('Thêm tất cả tài khoản thành công!');
    } catch (error) {
        console.error('Lỗi khi thêm tài khoản:', error);
    } finally {
        sql.close();
    }
}

addUsers();
