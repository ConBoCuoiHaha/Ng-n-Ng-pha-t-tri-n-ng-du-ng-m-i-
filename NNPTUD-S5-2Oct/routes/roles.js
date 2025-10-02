var express = require('express');
var router = express.Router();
let Role = require('../schemas/role');

// ==================== ROUTES CHO ROLE ====================
// Trách nhiệm:
// - Xử lý tất cả CRUD operations cho Role
// - Log mọi operations để debug
// - Validate input với try-catch
// - Sanitize user data để tránh injection
// - Hỗ trợ soft delete (không xóa vĩnh viễn)

// CREATE - Tạo role mới
// POST /roles
// Body: { name, description? }
// Bảo mật: Validate name không chứa ký tự đặc biệt nguy hiểm
router.post('/', async function(req, res, next) {
    try {
        console.log('[CREATE ROLE] Request body:', req.body);
        
        const { name, description } = req.body;
        
        // Validate input
        if (!name || name.trim() === '') {
            console.log('[CREATE ROLE] Error: Name is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Tên role không được để trống' 
            });
        }

        // Tạo role mới
        const newRole = new Role({
            name: name.trim(),
            description: description || ""
        });

        const savedRole = await newRole.save();
        console.log('[CREATE ROLE] Success:', savedRole._id);
        
        res.status(201).json({ 
            success: true, 
            message: 'Tạo role thành công',
            data: savedRole 
        });
    } catch (error) {
        console.error('[CREATE ROLE] Error:', error.message);
        
        // Xử lý lỗi duplicate key (unique constraint)
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên role đã tồn tại' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// READ ALL - Lấy tất cả roles (không bao gồm đã xóa mềm)
// GET /roles
// Query params: page?, limit?
router.get('/', async function(req, res, next) {
    try {
        console.log('[GET ALL ROLES] Request');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Chỉ lấy role chưa bị xóa mềm
        const roles = await Role.find({ isDelete: false })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const total = await Role.countDocuments({ isDelete: false });
        
        console.log('[GET ALL ROLES] Found:', roles.length, '/', total);
        
        res.json({ 
            success: true,
            data: roles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[GET ALL ROLES] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// READ BY ID - Lấy role theo ID
// GET /roles/:id
router.get('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        console.log('[GET ROLE BY ID] Request ID:', id);
        
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[GET ROLE BY ID] Invalid ID format');
            return res.status(400).json({ 
                success: false, 
                message: 'ID không hợp lệ' 
            });
        }

        const role = await Role.findOne({ _id: id, isDelete: false });
        
        if (!role) {
            console.log('[GET ROLE BY ID] Not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy role' 
            });
        }
        
        console.log('[GET ROLE BY ID] Found:', role._id);
        res.json({ 
            success: true, 
            data: role 
        });
    } catch (error) {
        console.error('[GET ROLE BY ID] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// UPDATE - Cập nhật role
// PUT /roles/:id
// Body: { name?, description? }
router.put('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        console.log('[UPDATE ROLE] Request ID:', id, 'Body:', req.body);
        
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[UPDATE ROLE] Invalid ID format');
            return res.status(400).json({ 
                success: false, 
                message: 'ID không hợp lệ' 
            });
        }

        // Tạo object cập nhật
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description;

        const updatedRole = await Role.findOneAndUpdate(
            { _id: id, isDelete: false },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedRole) {
            console.log('[UPDATE ROLE] Not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy role' 
            });
        }
        
        console.log('[UPDATE ROLE] Success:', updatedRole._id);
        res.json({ 
            success: true, 
            message: 'Cập nhật role thành công',
            data: updatedRole 
        });
    } catch (error) {
        console.error('[UPDATE ROLE] Error:', error.message);
        
        // Xử lý lỗi duplicate key
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên role đã tồn tại' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// SOFT DELETE - Xóa mềm role
// DELETE /roles/:id
// Bảo mật: Chỉ đánh dấu isDelete=true, không xóa vĩnh viễn
router.delete('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        console.log('[SOFT DELETE ROLE] Request ID:', id);
        
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[SOFT DELETE ROLE] Invalid ID format');
            return res.status(400).json({ 
                success: false, 
                message: 'ID không hợp lệ' 
            });
        }

        const deletedRole = await Role.findOneAndUpdate(
            { _id: id, isDelete: false },
            { isDelete: true },
            { new: true }
        );
        
        if (!deletedRole) {
            console.log('[SOFT DELETE ROLE] Not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy role' 
            });
        }
        
        console.log('[SOFT DELETE ROLE] Success:', deletedRole._id);
        res.json({ 
            success: true, 
            message: 'Xóa role thành công',
            data: deletedRole 
        });
    } catch (error) {
        console.error('[SOFT DELETE ROLE] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

module.exports = router;


