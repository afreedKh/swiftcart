const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
      }
    
});

module.exports = mongoose.model('Banner', bannerSchema);
