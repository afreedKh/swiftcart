const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
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
})


module.exports = addressSchema;