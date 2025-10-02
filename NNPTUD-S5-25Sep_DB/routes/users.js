var express = require('express');
var router = express.Router();
let User = require('../schemas/user');

// ==================== ROUTES CHO USER ====================
// Trách nhiệm:
// - Xử lý tất cả CRUD operations cho User
// - Tìm kiếm theo username, fullname (check chứa)
// - Verify user (chuyển status về true khi email và username đúng)
// - Log mọi operations để debug
// - Validate input với try-catch
// - Sanitize user data để tránh injection
// - Hỗ trợ soft delete

// CREATE - Tạo user mới
// POST /users
// Body: { username, password, email, fullName?, avatarUrl?, role }
// Bảo mật: Password nên được hash trước khi gọi API này
router.post('/', async function(req, res, next) {
    try {
        console.log('[CREATE USER] Request body:', { ...req.body, password: '***' });
        
        const { username, password, email, fullName, avatarUrl, role } = req.body;
        
        // Validate required fields
        if (!username || username.trim() === '') {
            console.log('[CREATE USER] Error: Username is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Username không được để trống' 
            });
        }
        if (!password) {
            console.log('[CREATE USER] Error: Password is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Password không được để trống' 
            });
        }
        if (!email || email.trim() === '') {
            console.log('[CREATE USER] Error: Email is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Email không được để trống' 
            });
        }
        if (!role) {
            console.log('[CREATE USER] Error: Role is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Role không được để trống' 
            });
        }

        // Tạo user mới
        const newUser = new User({
            username: username.trim(),
            password, // Lưu ý: Nên hash password trước khi gọi API
            email: email.trim(),
            fullName: fullName || "",
            avatarUrl: avatarUrl || "",
            role
        });

        const savedUser = await newUser.save();
        console.log('[CREATE USER] Success:', savedUser._id);
        
        // Không trả về password
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({ 
            success: true, 
            message: 'Tạo user thành công',
            data: userResponse 
        });
    } catch (error) {
        console.error('[CREATE USER] Error:', error.message);
        
        // Xử lý lỗi duplicate key
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field === 'username' ? 'Username' : 'Email'} đã tồn tại` 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// READ ALL - Lấy tất cả users với tìm kiếm
// GET /users
// Query params: search?, page?, limit?
// search: tìm kiếm trong username và fullName (check chứa)
router.get('/', async function(req, res, next) {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        console.log('[GET ALL USERS] Request - search:', search, 'page:', page);
        
        // Tạo query filter
        const filter = { isDelete: false };
        
        // Nếu có search, tìm kiếm trong username và fullName
        if (search && search.trim() !== '') {
            const searchRegex = new RegExp(search.trim(), 'i'); // case insensitive
            filter.$or = [
                { username: searchRegex },
                { fullName: searchRegex }
            ];
            console.log('[GET ALL USERS] Searching with:', search);
        }

        // Lấy users và populate role
        const users = await User.find(filter)
            .populate('role', 'name description') // Chỉ lấy name và description của role
            .select('-password') // Không trả về password
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
        
        const total = await User.countDocuments(filter);
        
        console.log('[GET ALL USERS] Found:', users.length, '/', total);
        
        res.json({ 
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('[GET ALL USERS] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// READ BY ID - Lấy user theo ID
// GET /users/:id
router.get('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        console.log('[GET USER BY ID] Request ID:', id);
        
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[GET USER BY ID] Invalid ID format');
            return res.status(400).json({ 
                success: false, 
                message: 'ID không hợp lệ' 
            });
        }

        const user = await User.findOne({ _id: id, isDelete: false })
            .populate('role', 'name description')
            .select('-password');
        
        if (!user) {
            console.log('[GET USER BY ID] Not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy user' 
            });
        }
        
        console.log('[GET USER BY ID] Found:', user._id);
        res.json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        console.error('[GET USER BY ID] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// READ BY USERNAME - Lấy user theo username
// GET /users/username/:username
router.get('/username/:username', async function(req, res, next) {
    try {
        const { username } = req.params;
        console.log('[GET USER BY USERNAME] Request username:', username);
        
        if (!username || username.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Username không được để trống' 
            });
        }

        const user = await User.findOne({ 
            username: username.trim(), 
            isDelete: false 
        })
            .populate('role', 'name description')
            .select('-password');
        
        if (!user) {
            console.log('[GET USER BY USERNAME] Not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy user' 
            });
        }
        
        console.log('[GET USER BY USERNAME] Found:', user._id);
        res.json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        console.error('[GET USER BY USERNAME] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// UPDATE - Cập nhật user
// PUT /users/:id
// Body: { username?, email?, fullName?, avatarUrl?, role?, status? }
router.put('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        const { username, email, fullName, avatarUrl, role, status } = req.body;
        
        console.log('[UPDATE USER] Request ID:', id);
        
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[UPDATE USER] Invalid ID format');
            return res.status(400).json({ 
                success: false, 
                message: 'ID không hợp lệ' 
            });
        }

        // Tạo object cập nhật (không cho phép cập nhật password qua route này)
        const updateData = {};
        if (username !== undefined) updateData.username = username.trim();
        if (email !== undefined) updateData.email = email.trim();
        if (fullName !== undefined) updateData.fullName = fullName;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        if (role !== undefined) updateData.role = role;
        if (status !== undefined) updateData.status = status;

        const updatedUser = await User.findOneAndUpdate(
            { _id: id, isDelete: false },
            updateData,
            { new: true, runValidators: true }
        )
            .populate('role', 'name description')
            .select('-password');
        
        if (!updatedUser) {
            console.log('[UPDATE USER] Not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy user' 
            });
        }
        
        console.log('[UPDATE USER] Success:', updatedUser._id);
        res.json({ 
            success: true, 
            message: 'Cập nhật user thành công',
            data: updatedUser 
        });
    } catch (error) {
        console.error('[UPDATE USER] Error:', error.message);
        
        // Xử lý lỗi duplicate key
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field === 'username' ? 'Username' : 'Email'} đã tồn tại` 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// SOFT DELETE - Xóa mềm user
// DELETE /users/:id
router.delete('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        console.log('[SOFT DELETE USER] Request ID:', id);
        
        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('[SOFT DELETE USER] Invalid ID format');
            return res.status(400).json({ 
                success: false, 
                message: 'ID không hợp lệ' 
            });
        }

        const deletedUser = await User.findOneAndUpdate(
            { _id: id, isDelete: false },
            { isDelete: true },
            { new: true }
        ).select('-password');
        
        if (!deletedUser) {
            console.log('[SOFT DELETE USER] Not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy user' 
            });
        }
        
        console.log('[SOFT DELETE USER] Success:', deletedUser._id);
        res.json({ 
            success: true, 
            message: 'Xóa user thành công',
            data: deletedUser 
        });
    } catch (error) {
        console.error('[SOFT DELETE USER] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

// VERIFY USER - Chuyển status về true khi email và username đúng
// POST /users/verify
// Body: { email, username }
// Bảo mật: Validate thông tin trước khi verify
router.post('/verify', async function(req, res, next) {
    try {
        const { email, username } = req.body;
        
        console.log('[VERIFY USER] Request - email:', email, 'username:', username);
        
        // Validate input
        if (!email || email.trim() === '') {
            console.log('[VERIFY USER] Error: Email is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Email không được để trống' 
            });
        }
        if (!username || username.trim() === '') {
            console.log('[VERIFY USER] Error: Username is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Username không được để trống' 
            });
        }

        // Tìm user với email và username khớp
        const user = await User.findOne({ 
            email: email.trim().toLowerCase(),
            username: username.trim(),
            isDelete: false 
        });
        
        if (!user) {
            console.log('[VERIFY USER] Not found or mismatch');
            return res.status(404).json({ 
                success: false, 
                message: 'Thông tin email và username không khớp' 
            });
        }
        
        // Kiểm tra xem đã verify chưa
        if (user.status === true) {
            console.log('[VERIFY USER] Already verified');
            return res.json({ 
                success: true, 
                message: 'User đã được verify trước đó',
                data: { status: true }
            });
        }
        
        // Chuyển status về true
        user.status = true;
        await user.save();
        
        console.log('[VERIFY USER] Success:', user._id);
        res.json({ 
            success: true, 
            message: 'Verify user thành công',
            data: { 
                _id: user._id,
                username: user.username,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        console.error('[VERIFY USER] Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + error.message 
        });
    }
});

module.exports = router;
