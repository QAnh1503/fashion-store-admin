# 🛍️ Fashion Store Admin Portal (React Native Expo)

Modern, cross-platform Admin Management application for the **Fashion Store**, built with **React Native** and **Expo**. Fully optimized for both **Web (Desktop / PC)** and **Mobile (iOS / Android)**.

---

## 📱 Features

- **100% English Interface**
- **Authentication**:
  - Screen: *Admin Portal Login*
  - Default Credentials: `admin` / `admin123`
  - Dynamic API URL selector for local server, emulator (`10.0.2.2`), or network LAN IP.
- **Product Management Dashboard**:
  - Responsive Layout:
    - **Web PC (Desktop)**: High-density data table displaying *Image*, *Product Name*, *Price*, *Quantity (soluong)*, and *Actions (Edit/Delete)*.
    - **Mobile**: Touch-optimized card list with instant action buttons.
  - **KPI Summary Cards**: Total Products, Total Stock Units, and Total Asset Inventory Value ($).
  - **Live Search**: Instant real-time filtering of fashion products by name.
  - **Modal Form (Add / Edit)**:
    - Inputs strictly for the 4 core schema fields: `name`, `price`, `soluong`, `image`.
    - Live image preview with placeholder fallback.
  - **Full CRUD API Integration**:
    - `GET /api/products`: Read collection
    - `POST /api/products`: Create new item
    - `PUT /api/products/:id`: Update existing item
    - `DELETE /api/products/:id`: Delete item with confirmation alert

---

## 🚀 How to Run

### 1. Start on Web Browser (PC / Desktop)
Navigate to the `frontend` directory and run:
```bash
cd frontend
npm run web
```
The application will launch automatically in your default browser at `http://localhost:8081`.

### 2. Start on Mobile (Expo Go / Emulator)
From the `frontend` directory:
```bash
cd frontend
npm start
```
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal.
- **Physical Phone**: Scan the QR code displayed in the terminal using the **Expo Go** app (ensure phone and PC are connected to the same Wi-Fi).

---

## 🌐 Connecting to the Backend API

By default, the app connects to:
- **Web Browser**: `http://localhost:5000/api`
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **Physical Phone over Wi-Fi**: Click the **⚙️ API Server Settings** button on the Login screen and enter your PC's LAN IP address (e.g., `http://192.168.1.15:5000/api`).
