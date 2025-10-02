var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');

/**
 * Routes CRUD cho Category
 * Trách nhiệm bảo mật:
 * - Validate tất cả input
 * - Sanitize data trước khi lưu vào DB
 * - Try-catch cho mọi operation
 * - Log operations cho debugging
 */

/* GET all categories - Chỉ lấy categories chưa bị xóa */
router.get('/', async function(req, res, next) {
  try {
    console.log('[Categories] GET all - Fetching categories');
    
    // Chỉ lấy các category có isDelete = false
    let categories = await categoryModel.find({ isDelete: false });
    
    console.log(`[Categories] Found ${categories.length} categories`);
    
    res.send({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('[Categories] Error fetching all:', error);
    res.status(500).send({
      success: false,
      message: 'Lỗi khi lấy danh sách categories',
      error: error.message
    });
  }
});

/* GET category by ID */
router.get('/:id', async function(req, res, next) {
  try {
    console.log('[Categories] GET by ID:', req.params.id);
    
    let category = await categoryModel.findById(req.params.id);
    
    // Kiểm tra null và isDelete
    if (!category || category.isDelete) {
      return res.status(404).send({
        success: false,
        message: 'Category không tồn tại hoặc đã bị xóa'
      });
    }
    
    res.send({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('[Categories] Error fetching by ID:', error);
    res.status(404).send({
      success: false,
      message: 'Category không tìm thấy',
      error: error.message
    });
  }
});

/* POST create new category */
router.post('/', async function(req, res, next) {
  try {
    console.log('[Categories] POST - Creating new category:', req.body.name);
    
    // Validate input
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).send({
        success: false,
        message: 'Tên category không được để trống'
      });
    }
    
    // Sanitize input - trim và validate
    let newCategory = new categoryModel({
      name: req.body.name.trim()
    });
    
    await newCategory.save();
    
    console.log('[Categories] Created successfully:', newCategory._id);
    
    res.status(201).send({
      success: true,
      message: 'Tạo category thành công',
      data: newCategory
    });
  } catch (error) {
    console.error('[Categories] Error creating:', error);
    
    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: 'Tên category đã tồn tại'
      });
    }
    
    res.status(400).send({
      success: false,
      message: 'Lỗi khi tạo category',
      error: error.message
    });
  }
});

/* PUT update category */
router.put('/:id', async function(req, res, next) {
  try {
    console.log('[Categories] PUT - Updating category:', req.params.id);
    
    // Validate input
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).send({
        success: false,
        message: 'Tên category không được để trống'
      });
    }
    
    // Kiểm tra category có tồn tại và chưa bị xóa
    let existingCategory = await categoryModel.findById(req.params.id);
    if (!existingCategory || existingCategory.isDelete) {
      return res.status(404).send({
        success: false,
        message: 'Category không tồn tại hoặc đã bị xóa'
      });
    }
    
    // Update
    let updatedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name.trim()
      },
      {
        new: true, // Trả về document sau khi update
        runValidators: true // Chạy validators
      }
    );
    
    console.log('[Categories] Updated successfully:', updatedCategory._id);
    
    res.send({
      success: true,
      message: 'Cập nhật category thành công',
      data: updatedCategory
    });
  } catch (error) {
    console.error('[Categories] Error updating:', error);
    
    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      return res.status(400).send({
        success: false,
        message: 'Tên category đã tồn tại'
      });
    }
    
    res.status(400).send({
      success: false,
      message: 'Lỗi khi cập nhật category',
      error: error.message
    });
  }
});

/* DELETE soft delete category - Đổi isDelete = true */
router.delete('/:id', async function(req, res, next) {
  try {
    console.log('[Categories] DELETE (soft) - Category:', req.params.id);
    
    // Kiểm tra category có tồn tại
    let category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: 'Category không tồn tại'
      });
    }
    
    // Kiểm tra đã bị xóa chưa
    if (category.isDelete) {
      return res.status(400).send({
        success: false,
        message: 'Category đã bị xóa trước đó'
      });
    }
    
    // Soft delete - chỉ đổi isDelete = true
    let deletedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      {
        isDelete: true
      },
      {
        new: true
      }
    );
    
    console.log('[Categories] Soft deleted successfully:', deletedCategory._id);
    
    res.send({
      success: true,
      message: 'Xóa category thành công (soft delete)',
      data: deletedCategory
    });
  } catch (error) {
    console.error('[Categories] Error deleting:', error);
    res.status(500).send({
      success: false,
      message: 'Lỗi khi xóa category',
      error: error.message
    });
  }
});

/**
 * Unit Test Responsibilities:
 * - Test GET all: trả về đúng categories có isDelete = false
 * - Test GET by id: trả về 404 nếu không tồn tại hoặc isDelete = true
 * - Test POST: validate tên trống, duplicate, success case
 * - Test PUT: validate input, category không tồn tại, success case
 * - Test DELETE: soft delete đúng, kiểm tra isDelete = true, edge case
 * - Test error handling cho tất cả routes
 */

module.exports = router;

