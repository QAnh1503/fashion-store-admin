const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /api/login - Đăng nhập admin đơn giản
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ username và password'
      });
    }

    // Tài khoản admin mặc định (hoặc cấu hình qua biến môi trường)
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUser && password === adminPass) {
      // Tạo JWT token đơn giản
      const token = jwt.sign(
        { username: adminUser, role: 'admin' },
        process.env.JWT_SECRET || 'fashion_secret_key_2026',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập admin thành công!',
        token,
        admin: {
          username: adminUser,
          role: 'admin'
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Tên đăng nhập hoặc mật khẩu không đúng!'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng nhập',
      error: error.message
    });
  }
});

module.exports = router;
