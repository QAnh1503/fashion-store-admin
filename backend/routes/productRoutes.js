const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// GET /api/products - Lấy danh sách sản phẩm thời trang
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
});

// GET /api/products/:id - Lấy chi tiết 1 sản phẩm (hỗ trợ thêm cho app)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết sản phẩm',
      error: error.message
    });
  }
});

// POST /api/products - Thêm sản phẩm thời trang mới
router.post('/', async (req, res) => {
  try {
    const { name, price, soluong, image } = req.body;

    // Chỉ lưu đúng 4 trường theo yêu cầu
    const newProduct = new Product({
      name,
      price,
      soluong,
      image
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công',
      data: savedProduct
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi khi thêm sản phẩm',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Cập nhật thông tin sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const { name, price, soluong, image } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (soluong !== undefined) updateData.soluong = soluong;
    if (image !== undefined) updateData.image = image;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để cập nhật'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để xóa'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công',
      data: deletedProduct
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
});

module.exports = router;
