# 👗 Fashion Store Backend API (Quản lý Cửa hàng Thời trang)

Hệ thống Backend RESTful API phục vụ ứng dụng Quản lý Cửa hàng Thời trang, xây dựng bằng **Node.js**, **Express** và kết nối cơ sở dữ liệu **MongoDB Atlas**. Hỗ trợ kết nối mượt mà với **React Native (Web & Mobile)**.

---

## 📁 Cấu trúc thư mục dự án

```text
DANENTANG/
├── models/
│   └── Product.js          # Mongoose Schema Product (chứa đúng 4 trường theo yêu cầu)
├── routes/
│   ├── authRoutes.js       # Route đăng nhập Admin (/api/login)
│   └── productRoutes.js    # Routes CRUD sản phẩm (/api/products)
├── products_seed.json      # File dữ liệu mẫu 5 sản phẩm thời trang
├── seed.js                 # Script nạp dữ liệu mẫu vào MongoDB Atlas
├── server.js               # Điểm khởi chạy Express server & cấu hình CORS, kết nối DB
├── .env                    # Biến môi trường (PORT, MONGODB_URI, JWT_SECRET, ...)
├── .env.example            # Bản mẫu biến môi trường
├── .gitignore              # Bỏ qua node_modules, .env khi push Git
├── package.json            # Thông tin dependencies và scripts
└── README.md               # Tài liệu hướng dẫn sử dụng API chi tiết
```

---

## 🎯 1. Chi tiết Mongoose Schema: `Product`

Schema sản phẩm được định nghĩa nghiêm ngặt với **ĐÚNG 4 TRƯỜNG** theo yêu cầu, tắt `versionKey` (`__v`) và tắt `timestamps` (`createdAt`, `updatedAt`):

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Có | Tên sản phẩm áo quần |
| `price` | `Number` | Có | Giá bán (VNĐ) |
| `soluong` | `Number` | Có | Số lượng hàng tồn kho |
| `image` | `String` | Có | URL hình ảnh đại diện sản phẩm |

---

## 🚀 2. Hướng dẫn cài đặt & Chạy dự án

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Cấu hình MongoDB Atlas trong file `.env`
Mở file `.env` và cập nhật chuỗi kết nối MongoDB Atlas của bạn:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/fashion_store?retryWrites=true&w=majority
JWT_SECRET=fashion_store_super_secret_jwt_key_2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```
*(Thay thế `<username>`, `<password>`, `<cluster-url>` bằng thông tin tài khoản MongoDB Atlas thật của bạn)*.

### Bước 3: Import dữ liệu mẫu vào MongoDB (Seeding)
Chạy lệnh sau để tự động đọc file `products_seed.json` và nạp vào MongoDB:
```bash
npm run seed
```

### Bước 4: Khởi động Server
- Chạy môi trường thông thường:
  ```bash
  npm start
  ```
- Hoặc chạy chế độ live-reload tự động:
  ```bash
  npm run dev
  ```
Server sẽ chạy mặc định tại: `http://localhost:5000`

---

## 🌐 3. Cấu hình CORS cho React Native (Web / Mobile)

Server đã được cấu hình middleware `cors` toàn diện tại `server.js`:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```
Điều này đảm bảo:
- Ứng dụng **React Native Web** chạy trên trình duyệt (localhost:19006, localhost:8081,...) không gặp lỗi *CORS preflight*.
- Ứng dụng **React Native Mobile (Expo / CLI)** kết nối trực tiếp qua IP mạng LAN mà không bị chặn.

> **Mẹo cho React Native Mobile (Expo/Emulator):**
> Thay vì dùng `http://localhost:5000`, hãy dùng IP máy tính của bạn trong mạng LAN (ví dụ: `http://192.168.1.15:5000`) hoặc `http://10.0.2.2:5000` (đối với Android Emulator).

---

## 📚 4. Tài liệu RESTful API

### 4.1. Đăng nhập Admin
- **Endpoint:** `POST /api/login`
- **Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response thành công (200 OK):**
  ```json
  {
    "success": true,
    "message": "Đăng nhập admin thành công!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "username": "admin",
      "role": "admin"
    }
  }
  ```

---

### 4.2. Lấy danh sách sản phẩm thời trang
- **Endpoint:** `GET /api/products`
- **Response thành công (200 OK):**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "_id": "6732f91a...",
        "name": "Men Leather Jacket",
        "price": 120,
        "soluong": 45,
        "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5..."
      }
    ]
  }
  ```

---

### 4.3. Thêm sản phẩm thời trang mới
- **Endpoint:** `POST /api/products`
- **Body (JSON):**
  ```json
  {
    "name": "Casual Bomber Jacket",
    "price": 95,
    "soluong": 40,
    "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500"
  }
  ```
- **Response thành công (201 Created):**
  ```json
  {
    "success": true,
    "message": "Thêm sản phẩm thành công",
    "data": {
      "_id": "6732fa2b...",
      "name": "Casual Bomber Jacket",
      "price": 95,
      "soluong": 40,
      "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500"
    }
  }
  ```

---

### 4.4. Cập nhật thông tin sản phẩm
- **Endpoint:** `PUT /api/products/:id`
- **Body (JSON):** *(có thể truyền một hoặc nhiều trường cần sửa)*
  ```json
  {
    "price": 89,
    "soluong": 50
  }
  ```
- **Response thành công (200 OK):**
  ```json
  {
    "success": true,
    "message": "Cập nhật sản phẩm thành công",
    "data": {
      "_id": "6732fa2b...",
      "name": "Casual Bomber Jacket",
      "price": 89,
      "soluong": 50,
      "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500"
    }
  }
  ```

---

### 4.5. Xóa sản phẩm
- **Endpoint:** `DELETE /api/products/:id`
- **Response thành công (200 OK):**
  ```json
  {
    "success": true,
    "message": "Xóa sản phẩm thành công",
    "data": {
      "_id": "6732fa2b...",
      "name": "Casual Bomber Jacket",
      "price": 89,
      "soluong": 50,
      "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500"
    }
  }
  ```
