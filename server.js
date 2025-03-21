const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const path = require('path');
const dbConfig = require('./config/dbconfig');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ file tĩnh

const JWT_SECRET = '123421152';

// Route gốc
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

// Route đăng nhập
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM Account WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Đăng nhập thất bại: sai tên tài khoản hoặc mật khẩu' });
        }
        const account = result.recordset[0];

        // So sánh trực tiếp mật khẩu plaintext
        if (password !== account.password) {
            return res.status(401).json({ message: 'Đăng nhập thất bại: sai tên tài khoản hoặc mật khẩu' });
        }

        if (!account.is_active) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        const token = jwt.sign(
            { id: account.id, username: account.username, role: account.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token: token,
            role: account.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Middleware kiểm tra token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không có token' });

    jwt.verify(token, JWT_SECRET, (err, account) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
        req.account = account;
        next();
    });
};

// Route bảo vệ để truy cập index.html
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

// Route bảo vệ (dữ liệu JSON)
app.get('/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Đây là dữ liệu bảo vệ',
        account: {
            id: req.account.id,
            username: req.account.username,
            role: req.account.role
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chạy trên port ${PORT}`);
});