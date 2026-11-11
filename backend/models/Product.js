const mongoose = require('mongoose');

// Schema đại diện cho sản phẩm thời trang với đúng 4 trường theo yêu cầu
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm không được để trống'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Giá bán không được để trống'],
      min: [0, 'Giá bán phải lớn hơn hoặc bằng 0']
    },
    soluong: {
      type: Number,
      required: [true, 'Số lượng tồn kho không được để trống'],
      min: [0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0']
    },
    image: {
      type: String,
      required: [true, 'URL hình ảnh không được để trống'],
      trim: true
    }
  },
  {
    versionKey: false,  // Tắt trường __v mặc định của Mongoose
    timestamps: false,  // Tắt trường createdAt và updatedAt
    strict: true        // Bỏ qua mọi trường lạ không nằm trong 4 trường đã định nghĩa
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
