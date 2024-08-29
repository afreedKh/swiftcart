const mongoose = require('mongoose');




const orderSchema =  mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    itemsOrdered: [
        {
            itemName: {
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
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        name:{
            type:String,
            require:true
        },
        phone:{
            type:Number,
            require:true
        },
        pincode:{
            type:Number,
            required:true
        },
        locality:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:false
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        landmark:{
            type:String,
            required:false
        },
        alternatePhone:{
            type:Number,
            required:false
        },
        addressType:{
            type:String,
            enum:['home','work'],
            default:false
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    },
    estimatedDeliveryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Order', orderSchema);


