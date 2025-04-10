const sql = require('mssql');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const dbConfig = require('./config/dbconfig');

async function addUser(id, username, password, roleId) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date();

        let pool = await sql.connect(dbConfig);

        // Thêm user vào bảng Accounts
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, hashedPassword)
            .input('roleId', sql.Int, roleId)
            .input('isActive', sql.Bit, 1)
            .input('createdAt', sql.DateTime, createdAt)
            .input('updatedAt', sql.DateTime, createdAt)
            .query(`
                INSERT INTO Accounts (Id, Username, Password, RoleId, IsActive, CreatedAt, UpdatedAt)
                VALUES (@id, @username, @password, @roleId, @isActive, @createdAt, @updatedAt)
            `);

        console.log(`Tạo tài khoản thành công`);

        // Đường dẫn tới users.json
        const filePath = path.join(__dirname, 'users.json');
        let existingUsers = [];

        // Đọc file nếu đã tồn tại
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            if (data.trim()) {
                existingUsers = JSON.parse(data);
            }
        }
        // Thêm tài khoản mới vào mảng
        existingUsers.push({ id, username, password, roleId });

        // Ghi lại vào file
        fs.writeFileSync(filePath, JSON.stringify(existingUsers, null, 2), 'utf8');
    } catch (error) {
        console.error('Lỗi khi thêm user:', error.message);
    }
}


// 👉 Gọi hàm: nhập ID tùy bạn
addUser('SV010', 'sinhvien010', '1234533216789', 1); // id, username, password, roleId
