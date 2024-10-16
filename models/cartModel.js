const mongoose = require('mongoose');



const cartItemSchema = mongoose.Schema({
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
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    price:{
        type:Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
})

const cartSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[cartItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model("Cart",cartSchema);