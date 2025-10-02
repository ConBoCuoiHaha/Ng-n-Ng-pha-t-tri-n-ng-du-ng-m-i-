let mongoose = require('mongoose');

// Schema cho Role
// Trách nhiệm: 
// - Định nghĩa cấu trúc dữ liệu cho Role với validation
// - Đảm bảo name là unique và required
// - Hỗ trợ soft delete với isDelete flag
// - Tự động thêm timestamp (createdAt, updatedAt)
let schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên role không được để trống"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('role', schema);


