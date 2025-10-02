let mongoose = require('mongoose');

// Schema cho User
// Trách nhiệm:
// - Định nghĩa cấu trúc dữ liệu cho User với validation đầy đủ
// - Đảm bảo username và email là unique, required
// - Reference đến Role collection
// - Validate loginCount >= 0
// - Hỗ trợ soft delete với isDelete flag
// - Tự động thêm timestamp (createdAt, updatedAt)
// Bảo mật: Password nên được hash trước khi lưu (cần xử lý ở controller)
let schema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username không được để trống"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password không được để trống"]
    },
    email: {
        type: String,
        required: [true, "Email không được để trống"],
        unique: true,
        trim: true,
        lowercase: true,
        // Validate email format
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    fullName: {
        type: String,
        default: ""
    },
    avatarUrl: {
        type: String,
        default: ""
    },
    status: {
        type: Boolean,
        default: false
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role',
        required: [true, "Role không được để trống"]
    },
    loginCount: {
        type: Number,
        default: 0,
        min: [0, "Login count không thể âm"]
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('user', schema);


