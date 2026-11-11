# 🛍️ Fashion Store Management (Fullstack Application)

Dự án Quản lý Cửa hàng Thời trang đa nền tảng gồm hệ thống **Backend RESTful API** (Node.js, Express, MongoDB Atlas) và **Frontend** (React Native, Expo) chạy trên cả Web Browser và Điện thoại di động.

---

## 📁 Cấu trúc thư mục dự án sau khi tái cấu trúc

```text
DANENTANG/
├── backend/                        # [BACKEND] Node.js, Express, MongoDB Atlas
│   ├── models/
│   │   └── Product.js              # Mongoose Schema Product (đúng 4 trường bắt buộc)
│   ├── routes/
│   │   ├── authRoutes.js           # Route đăng nhập Admin (/api/login)
│   │   └── productRoutes.js        # Routes CRUD sản phẩm (/api/products)
│   ├── node_modules/               # Dependencies của backend
│   ├── products_seed.json          # File 5 sản phẩm thời trang mẫu (English)
│   ├── seed.js                     # Script nạp dữ liệu mẫu vào MongoDB Atlas
│   ├── server.js                   # Express server & CORS, kết nối DB
│   ├── .env                        # Biến môi trường MongoDB Atlas, Port
│   ├── .env.example                # Mẫu biến môi trường
│   ├── .gitignore                  # Gitignore cho backend
│   ├── package.json                # Dependencies backend
│   └── README.md                   # Tài liệu chi tiết API Backend
│
├── frontend/                       # [FRONTEND] React Native Expo (Web & Mobile)
│   ├── src/
│   │   ├── config.js               # Cấu hình API URL tự động
│   │   ├── screens/
│   │   │   ├── LoginScreen.js      # Giao diện đăng nhập Admin Portal
│   │   │   └── DashboardScreen.js  # Giao diện Quản lý kho hàng (Table / Cards)
│   │   └── components/
│   │       └── ProductModal.js     # Modal Thêm/Sửa sản phẩm kèm Preview ảnh
│   ├── App.js                      # Root component
│   ├── package.json                # Dependencies frontend
│   └── README.md                   # Hướng dẫn chạy frontend
│
├── package.json                    # Root scripts tiện ích điều khiển cả dự án
└── README.md                       # Tài liệu tổng quan dự án
```

---

## ⚡ Các lệnh chạy nhanh từ thư mục gốc

Bạn có thể chạy trực tiếp từ thư mục gốc `DANENTANG/`:

| Lệnh | Chức năng |
| :--- | :--- |
| `npm run backend` | Khởi động Backend API (`http://localhost:5000`) |
| `npm run backend:dev` | Khởi động Backend với chế độ hot-reload (`--watch`) |
| `npm run seed` | Nạp dữ liệu mẫu vào MongoDB Atlas |
| `npm run frontend:web` | Khởi động Frontend trên Web Browser (`http://localhost:8081`) |
| `npm run frontend` | Khởi động Frontend Expo Metro Bundler (Mobile & Web) |

---

## 🔧 Hoặc chạy độc lập trong từng thư mục:

### 1. Backend (`cd backend`)
```bash
cd backend
npm run seed     # Nạp dữ liệu vào MongoDB
npm start        # Khởi động Backend Server (PORT 5000)
```

### 2. Frontend (`cd frontend`)
```bash
cd frontend
npm run web      # Mở ứng dụng trên trình duyệt Web PC
npm start        # Mở Expo Go cho điện thoại di động
```
