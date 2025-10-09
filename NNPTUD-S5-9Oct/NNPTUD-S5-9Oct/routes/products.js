var express = require('express');
var router = express.Router();
let products = require('../schemas/product');
let categories = require('../schemas/category');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// GET /products - View: USER, MOD, ADMIN
router.get('/', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    let query = { isDeleted: false };
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Search by name if provided
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let allProducts = await products.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'username fullName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await products.countDocuments(query);
    
    Response(res, 200, true, {
      products: allProducts,
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

// GET /products/:id - View: USER, MOD, ADMIN
router.get('/:id', Authentication, Authorization('USER', 'MOD', 'ADMIN'), async function(req, res, next) {
  try {
    let product = await products.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName');
    
    if (!product || product.isDeleted) {
      return Response(res, 404, false, "Product not found");
    }
    
    Response(res, 200, true, product);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST /products - Create: MOD, ADMIN
router.post('/', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category) {
      return Response(res, 400, false, "Name, price, and category are required");
    }
    
    // Check if category exists
    let category = await categories.findById(req.body.category);
    if (!category || category.isDeleted) {
      return Response(res, 400, false, "Invalid category");
    }
    
    let newProduct = new products({
      name: req.body.name,
      description: req.body.description || '',
      price: req.body.price,
      category: req.body.category,
      imageURL: req.body.imageURL || '',
      stock: req.body.stock || 0,
      createdBy: req.userId
    });
    
    await newProduct.save();
    await newProduct.populate('category', 'name');
    await newProduct.populate('createdBy', 'username fullName');
    
    Response(res, 201, true, newProduct);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// PUT /products/:id - Update: MOD, ADMIN
router.put('/:id', Authentication, Authorization('MOD', 'ADMIN'), async function(req, res, next) {
  try {
    let product = await products.findById(req.params.id);
    if (!product || product.isDeleted) {
      return Response(res, 404, false, "Product not found");
    }
    
    // Check if category exists (if provided)
    if (req.body.category) {
      let category = await categories.findById(req.body.category);
      if (!category || category.isDeleted) {
        return Response(res, 400, false, "Invalid category");
      }
      product.category = req.body.category;
    }
    
    if (req.body.name) product.name = req.body.name;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.imageURL !== undefined) product.imageURL = req.body.imageURL;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    
    product.updatedBy = req.userId;
    await product.save();
    
    await product.populate('category', 'name');
    await product.populate('createdBy', 'username fullName');
    await product.populate('updatedBy', 'username fullName');
    
    Response(res, 200, true, product);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE /products/:id - Delete: ADMIN only
router.delete('/:id', Authentication, Authorization('ADMIN'), async function(req, res, next) {
  try {
    let product = await products.findById(req.params.id);
    if (!product || product.isDeleted) {
      return Response(res, 404, false, "Product not found");
    }
    
    // Soft delete
    product.isDeleted = true;
    product.updatedBy = req.userId;
    await product.save();
    
    Response(res, 200, true, "Product deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
