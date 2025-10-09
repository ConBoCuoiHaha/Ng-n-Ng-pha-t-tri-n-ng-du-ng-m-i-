var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let { Response } = require('../utils/responseHandler');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    let allUsers = await users.find({isDeleted:false}).populate({
      path: 'role',
      select:'name'
    });
    Response(res, 200, true, allUsers);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});
router.get('/:id', async function(req, res, next) {
  try {
    let getUser = await users.findById(req.params.id);
    if (!getUser || getUser.isDeleted) {
      return Response(res, 404, false, "User not found");
    }
    Response(res, 200, true, getUser);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

router.post('/', async function(req, res, next) {
  try {
    let roleName = req.body.role ? req.body.role : "USER";
    let role = await roles.findOne({name: roleName});
    if (!role) {
      return Response(res, 400, false, "Invalid role");
    }
    
    let newUser = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      fullName: req.body.fullName || '',
      role: role._id
    });
    
    await newUser.save();
    Response(res, 201, true, newUser);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});
router.put('/:id', async function(req, res, next) {
  try {
    let user = await users.findById(req.params.id);
    if (!user || user.isDeleted) {
      return Response(res, 404, false, "User not found");
    }
    
    if (req.body.email) user.email = req.body.email;
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.password) user.password = req.body.password;
    
    await user.save();
    Response(res, 200, true, user);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
