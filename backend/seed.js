const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://<username>:<password>@cluster0.mongodb.net/fashion_store?retryWrites=true&w=majority';

const seedProducts = async () => {
  try {
    console.log('Đang kết nối tới MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Kết nối MongoDB thành công!');

    // Đọc dữ liệu từ products_seed.json
    const seedFilePath = path.join(__dirname, 'products_seed.json');
    const rawData = fs.readFileSync(seedFilePath, 'utf-8');
    const productsData = JSON.parse(rawData);

    // Xóa các sản phẩm cũ trước khi import dữ liệu mới (tùy chọn)
    await Product.deleteMany({});
    console.log('Đã làm sạch dữ liệu cũ trong collection products.');

    // Import sample data
    const inserted = await Product.insertMany(productsData);
    console.log(`=> Successfully seeded ${inserted.length} fashion products into MongoDB:`);
    inserted.forEach((prod, index) => {
      console.log(`   ${index + 1}. [${prod.name}] - Price: $${prod.price} - Stock: ${prod.soluong}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi import dữ liệu mẫu:', error.message);
    if (MONGODB_URI.includes('<username>') || MONGODB_URI.includes('<password>')) {
      console.log('\n=> LƯU Ý: Vui lòng thay thế <username> và <password> trong file .env bằng chuỗi kết nối MongoDB Atlas thật của bạn trước khi chạy seed!');
    }
    process.exit(1);
  }
};

seedProducts();
