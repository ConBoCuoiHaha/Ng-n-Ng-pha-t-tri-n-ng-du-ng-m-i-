var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product')



/* GET users listing - Chỉ lấy products chưa bị xóa */
router.get('/', async function(req, res, next) {
  try {
    console.log('[Products] GET all - Fetching products');
    
    // Chỉ lấy các product có isDelete = false
    let products = await productModel.find({ isDelete: false });
    
    console.log(`[Products] Found ${products.length} products`);
    
    res.send({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('[Products] Error fetching all:', error);
    res.status(500).send({
      success: false,
      message: 'Lỗi khi lấy danh sách products',
      error: error.message
    });
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    let item = await productModel.findById(req.params.id);
    res.send({
      success: true,
      data:item
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data:error
    })
  }
});
router.post('/', async function(req,res,next){
  try {
    let newItem = new productModel({
      name: req.body.name,
      price:req.body.price,
      description:req.body.description,
      category:req.body.category
    })
    await newItem.save()
    res.send({
      success: true,
      data:newItem
    })
  } catch (error) {
    res.status(404).send({
      success: false,
      data:error
    })
  }
})
router.put('/:id', async function(req,res,next){
  let updatedItem = await productModel.findByIdAndUpdate(
    req.params.id,
    {
      name:req.body.name,
      price:req.body.price,
      description:req.body.description,
      category:req.body.category
    },{
      new:true
    }
  )
  res.send({
      success: true,
      data:updatedItem
    })

  // let item = await productModel.findById(req.params.id);
  // item.name = req.body.name?req.body.name:item.name;
  // item.price = req.body.price?req.body.price:item.price;
  // item.description = req.body.description?req.body.description:item.description;
  // item.category = req.body.category?req.body.category:item.category;
  // await item.save();
  // res.send({
  //   success: true,
  //   data:item
  // })  
})

/* DELETE soft delete product - Đổi isDelete = true */
router.delete('/:id', async function(req, res, next) {
  try {
    console.log('[Products] DELETE (soft) - Product:', req.params.id);
    
    // Kiểm tra product có tồn tại
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: 'Product không tồn tại'
      });
    }
    
    // Kiểm tra đã bị xóa chưa
    if (product.isDelete) {
      return res.status(400).send({
        success: false,
        message: 'Product đã bị xóa trước đó'
      });
    }
    
    // Soft delete - chỉ đổi isDelete = true
    let deletedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        isDelete: true
      },
      {
        new: true
      }
    );
    
    console.log('[Products] Soft deleted successfully:', deletedProduct._id);
    
    res.send({
      success: true,
      message: 'Xóa product thành công (soft delete)',
      data: deletedProduct
    });
  } catch (error) {
    console.error('[Products] Error deleting:', error);
    res.status(500).send({
      success: false,
      message: 'Lỗi khi xóa product',
      error: error.message
    });
  }
});

module.exports = router;
