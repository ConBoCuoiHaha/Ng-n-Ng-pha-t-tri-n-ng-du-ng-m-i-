var express = require('express');
var router = express.Router();
let users = require('../schemas/users');
let roles = require('../schemas/roles');
let { Authentication } = require('../utils/authHandler');
let { Response } = require('../utils/responseHandler');
let { uploadAFileWithField } = require('../utils/uploadHandler');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let allUsers = await users.find({isDeleted:false}).populate({
    path: 'role',
    select:'name'
  });
  res.send({
    success:true,
    data:allUsers
  });
});
router.get('/:id', async function(req, res, next) {
  try {
    let getUser = await users.findById(req.params.id);
    getUser = getUser.isDeleted ? new Error("ID not found") : getUser;
    res.send({
      success:true,
      data:getUser
    });
  } catch (error) {
     res.send({
      success:true,
      data:error
    });
  }
});

router.post('/', async function(req, res, next) {
  let role = req.body.role?req.body.role:"USER";
  let roleId;
  role = await roles.findOne({name:role});
  roleId = role._id;
  let newUser = new users({
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    role:roleId
  })
  await newUser.save();
  res.send({
      success:true,
      data:newUser
    })
});
router.put('/:id', async function(req, res, next) {
  let user = await users.findById(req.params.id);
  user.email = req.body.email?req.body.email:user.email;
  user.fullName = req.body.fullName?req.body.fullName:user.fullName;
  user.password = req.body.password?req.body.password:user.password;
  await user.save()
  res.send({
      success:true,
      data:user
    })
});

module.exports = router;
// Upload avatar for logged-in user
router.post('/avatar', Authentication, uploadAFileWithField('avatar'), async function (req, res, next) {
  try {
    if (!req.file) {
      return Response(res, 400, false, 'No file uploaded or invalid type');
    }
    let user = await users.findById(req.userId);
    if (!user) {
      return Response(res, 404, false, 'User not found');
    }
    const avatarURL = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
    user.avatarURL = avatarURL;
    await user.save();
    Response(res, 200, true, { avatarURL });
  } catch (error) {
    Response(res, 500, false, error.message || 'Upload failed');
  }
});
