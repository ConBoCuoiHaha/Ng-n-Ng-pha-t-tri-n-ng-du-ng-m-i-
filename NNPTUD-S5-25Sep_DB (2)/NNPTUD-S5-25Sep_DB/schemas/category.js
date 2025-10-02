let mongoose = require('mongoose');

// Schema Category - Quản lý danh mục sản phẩm
// Trách nhiệm bảo mật: Validate input, prevent injection
let schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên category không được để trống"],
        unique: true,
        trim: true,
        minlength: [2, "Tên category phải có ít nhất 2 ký tự"],
        maxlength: [100, "Tên category không được quá 100 ký tự"]
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tự động tạo createdAt và updatedAt
});

// Logging: Log mỗi khi tạo category mới
schema.post('save', function(doc) {
    console.log('[Category Schema] Đã tạo category mới:', doc.name);
});

module.exports = mongoose.model('category', schema);

