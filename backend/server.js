const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Nạp biến môi trường từ file .env trong thư mục backend
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình CORS để ứng dụng React Native (Web/Mobile) truy cập API không bị chặn
app.use(
  cors({
    origin: '*', // Cho phép mọi nguồn gốc (React Native mobile, Expo, React web, v.v.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Middleware xử lý JSON payload và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request đơn giản
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// Phân hệ Admin API
app.use('/api', authRoutes); // POST /api/login
app.use('/api/products', productRoutes); // GET, POST, PUT, DELETE /api/products

// Route kiểm tra trạng thái server
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Quản lý Cửa hàng Thời trang đang hoạt động!',
    endpoints: {
      login: 'POST /api/login',
      getProducts: 'GET /api/products',
      addProduct: 'POST /api/products',
      updateProduct: 'PUT /api/products/:id',
      deleteProduct: 'DELETE /api/products/:id'
    }
  });
});

// Middleware xử lý 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Đường dẫn không tồn tại (404 Not Found)'
  });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi trên máy chủ',
    error: err.message
  });
});

// Kết nối cơ sở dữ liệu MongoDB Atlas
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://<username>:<password>@cluster0.mongodb.net/fashion_store?retryWrites=true&w=majority';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('=> Đã kết nối thành công tới MongoDB Atlas!');
    app.listen(PORT, () => {
      console.log(`=> Server đang chạy tại cổng http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('=> Lỗi kết nối MongoDB Atlas:', err.message);
    console.log('=> Vui lòng cấu hình đúng MONGODB_URI trong file .env');
    // Vẫn khởi động server để có thể kiểm tra các endpoint khác nếu cần
    app.listen(PORT, () => {
      console.log(`=> Server vẫn đang lắng nghe tại cổng http://localhost:${PORT} (Chưa kết nối DB)`);
    });
  });
