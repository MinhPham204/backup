// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { sql, poolPromise } = require("../models/db");
// require("dotenv").config();

// const router = express.Router();

// // Đăng nhập
// router.post("/login", async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const pool = await poolPromise;

//         // Kiểm tra user có tồn tại không
//         const result = await pool
//             .request()
//             .input("username", sql.VarChar, username)
//             .query("SELECT * FROM account WHERE username = @username");

//         if (result.recordset.length === 0) {
//             return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
//         }

//         const user = result.recordset[0];

//         // Kiểm tra tài khoản có bị vô hiệu hóa không
//         if (!user.is_active) {
//             return res.status(403).json({ error: "Tài khoản đã bị khóa" });
//         }

//         // So sánh mật khẩu đã mã hóa
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
//         }

//         // Tạo JWT Token
//         const token = jwt.sign(
//             { userId: user.id, username: user.username, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: "1h" }
//         );

//         res.json({ token, role: user.role });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;
