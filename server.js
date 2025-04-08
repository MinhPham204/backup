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
        console.log('Login attempt:', { username }); // Log để debug

        if (!username || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
            });
        }

        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM Accounts WHERE LOWER(Username) = LOWER(@username)');

        if (result.recordset.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Đăng nhập thất bại: sai tên tài khoản hoặc mật khẩu'
            });
        }
        const account = result.recordset[0];

        // So sánh trực tiếp mật khẩu plaintext
        if (password !== account.Password) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Đăng nhập thất bại: sai tên tài khoản hoặc mật khẩu'
            });
        }

        if (!account.IsActive) {
            console.log('Inactive account:', username);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Tài khoản đã bị khóa'
            });
        }

        const token = jwt.sign(
            { id: account.Id, username: account.Username, role: account.RoleId },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful:', username);
        res.json({
            message: 'Đăng nhập thành công',
            token: token,
            role: account.RoleId
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Lỗi server: ' + error.message
        });
    }
});

// Middleware kiểm tra token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader); // Log để debug

    if (!authHeader) {
        console.log('No auth header found');
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.'
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('No token found in auth header');
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Token không hợp lệ. Vui lòng đăng nhập lại.'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
            });
        }
        req.user = user;
        next();
    });
};

// Route bảo vệ (dữ liệu JSON)
app.get('/protected', (req, res) => {
    res.json({
        message: 'Đây là dữ liệu bảo vệ',
        account: {
            id: req.user.Id,
            username: req.user.Username,
            role: req.user.RoleId
        }
    });
});

// Import và sử dụng groupRoutes
const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes);

// API endpoint để lấy danh sách lớp
app.get('/api/classes', async (req, res) => {
    try {
        console.log('Connecting to database...');
        let pool = await sql.connect(dbConfig);
        console.log('Connected to database');

        console.log('Executing query...');
        const result = await pool.request()
            .query('SELECT Id as id, ClassName as className FROM Classes ORDER BY ClassName');
        console.log('Query executed successfully');
        console.log('Found classes:', result.recordset.length);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error in /api/classes:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        try {
            await sql.close();
            console.log('Database connection closed');
        } catch (err) {
            console.error('Error closing database connection:', err);
        }
    }
});

// API endpoint để lấy danh sách môn học
app.get('/api/subjects', async (req, res) => {
    try {
        console.log('Connecting to database...');
        let pool = await sql.connect(dbConfig);
        console.log('Connected to database');

        console.log('Executing query...');
        const result = await pool.request()
            .query('SELECT Id as id, SubjectName as subjectName, SubjectCode as subjectCode FROM Subjects ORDER BY SubjectName');
        console.log('Query executed successfully');
        console.log('Found subjects:', result.recordset.length);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error in /api/subjects:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        try {
            await sql.close();
            console.log('Database connection closed');
        } catch (err) {
            console.error('Error closing database connection:', err);
        }
    }
});

// Route cho trang group-page
app.get('/group-page.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'group-page.html'));
});

// Route cho trang group-detail
app.get('/group-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'group-detail.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chạy trên port ${PORT}`);
});
