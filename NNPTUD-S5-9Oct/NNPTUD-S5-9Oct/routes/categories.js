var express = require('express');
var router = express.Router();
let categories = require('../schemas/category');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// GET /categories - View: USER, MOD, ADMIN
router.get('/', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    let query = { isDeleted: false };
    
    // Search by name if provided
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let allCategories = await categories.find(query)
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await categories.countDocuments(query);
    
    Response(res, 200, true, {
      categories: allCategories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET /categories/:id - View: USER, MOD, ADMIN
router.get('/:id', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    let category = await categories.findById(req.params.id)
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName');
    
    if (!category || category.isDeleted) {
      return Response(res, 404, false, "Category not found");
    }
    
    Response(res, 200, true, category);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST /categories - Create: MOD, ADMIN
router.post('/', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    // Validate required fields
    if (!req.body.name) {
      return Response(res, 400, false, "Name is required");
    }
    
    // Check if category name already exists
    let existingCategory = await categories.findOne({ 
      name: req.body.name, 
      isDeleted: false 
    });
    
    if (existingCategory) {
      return Response(res, 400, false, "Category name already exists");
    }
    
    let newCategory = new categories({
      name: req.body.name,
      description: req.body.description || '',
      imageURL: req.body.imageURL || '',
      createdBy: req.userId
    });
    
    await newCategory.save();
    await newCategory.populate('createdBy', 'username fullName');
    
    Response(res, 201, true, newCategory);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// PUT /categories/:id - Update: MOD, ADMIN
router.put('/:id', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    let category = await categories.findById(req.params.id);
    if (!category || category.isDeleted) {
      return Response(res, 404, false, "Category not found");
    }
    
    // Check if new name already exists (if name is being updated)
    if (req.body.name && req.body.name !== category.name) {
      let existingCategory = await categories.findOne({ 
        name: req.body.name, 
        isDeleted: false,
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return Response(res, 400, false, "Category name already exists");
      }
    }
    
    if (req.body.name) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.imageURL !== undefined) category.imageURL = req.body.imageURL;
    
    category.updatedBy = req.userId;
    await category.save();
    
    await category.populate('createdBy', 'username fullName');
    await category.populate('updatedBy', 'username fullName');
    
    Response(res, 200, true, category);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE /categories/:id - Delete: ADMIN only
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req, res, next) {
  try {
    let category = await categories.findById(req.params.id);
    if (!category || category.isDeleted) {
      return Response(res, 404, false, "Category not found");
    }
    
    // Check if category has products
    let products = require('../schemas/product');
    let categoryProducts = await products.find({ 
      category: req.params.id, 
      isDeleted: false 
    });
    
    if (categoryProducts.length > 0) {
      return Response(res, 400, false, "Cannot delete category with existing products");
    }
    
    // Soft delete
    category.isDeleted = true;
    category.updatedBy = req.userId;
    await category.save();
    
    Response(res, 200, true, "Category deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET /categories/:id/products - Get products by category
router.get('/:id/products', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    let category = await categories.findById(req.params.id);
    if (!category || category.isDeleted) {
      return Response(res, 404, false, "Category not found");
    }
    
    let products = require('../schemas/product');
    let categoryProducts = await products.find({ 
      category: req.params.id, 
      isDeleted: false 
    })
    .populate('createdBy', 'username fullName')
    .sort({ createdAt: -1 });
    
    Response(res, 200, true, {
      category: category,
      products: categoryProducts
    });
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
