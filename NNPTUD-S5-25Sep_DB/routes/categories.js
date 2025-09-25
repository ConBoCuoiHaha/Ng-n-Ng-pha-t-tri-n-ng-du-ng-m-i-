var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');

router.get('/', async function(req, res) {
  try {
    let categories = await categoryModel.find({});
    res.send({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

router.get('/:id', async function(req, res) {
  try {
    let item = await categoryModel.findById(req.params.id);
    if (!item) {
      return res.status(404).send({
        success: false,
        data: null
      });
    }
    res.send({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

router.post('/', async function(req, res) {
  try {
    let newItem = new categoryModel({
      name: req.body.name
    });
    await newItem.save();
    res.status(201).send({
      success: true,
      data: newItem
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

router.put('/:id', async function(req, res) {
  try {
    let updatedItem = await categoryModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name
      },
      {
        new: true
      }
    );

    if (!updatedItem) {
      return res.status(404).send({
        success: false,
        data: null
      });
    }

    res.send({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      data: error
    });
  }
});

router.delete('/:id', async function(req, res) {
  try {
    let deletedItem = await categoryModel.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).send({
        success: false,
        data: null
      });
    }
    res.send({
      success: true,
      data: deletedItem
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      data: error
    });
  }
});

module.exports = router;
