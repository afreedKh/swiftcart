const mongoose = require('mongoose');
const addressSchema = require('./addressesSchema'); // Adjust the path as needed

const orderItemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    varientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product.varients',
        required:true
    },
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    itemsOrdered: [orderItemSchema],
    actualMrp: {
        type: Number,
        required: true
    },
    offerDiscount:{
        type:Number,
    },
    subtotal: {
        type: Number,
        required: true
    },
    couponDiscount:{
        type:Number
    },
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: addressSchema,
        required: true
    },
    estimatedDeliveryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled','Returned','Return-Requested','Return-Cancelled','Pending'],
        default: 'Processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    paymentMethod:{
        type:String,
        required:true
    },
    returnReason: [{
        reason: String,
        message: String
    }]
});

module.exports = mongoose.model('Order', orderSchema);
