const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('Kiểm tra token:', token ? 'Có token' : 'Không có token');

    if (!token) {
        console.log('Không tìm thấy token xác thực');
        return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token không hợp lệ:', err.message);
            return res.status(403).json({ 
                error: 'Forbidden',
                message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
            });
        }
        console.log('Token hợp lệ cho user:', user.username);
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken }; 