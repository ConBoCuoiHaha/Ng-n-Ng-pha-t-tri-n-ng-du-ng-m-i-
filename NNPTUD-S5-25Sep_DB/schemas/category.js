let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'category name is required'],
        unique: true
    }
}, {
    timestamps: true
});

module.exports = new mongoose.model('category', schema);
