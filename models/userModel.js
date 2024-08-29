const mongoose = require('mongoose');
const addressSchema = require('../models/addressesSchema');


const userScema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPassword:{
        type:String,
        required:true
    },
    token:{
        type:String,
        default:''
    },
    is_admin:{
        type:Number,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false 
    },
    gender:{
        type:String,
        enum:['male','female'],
        
    },
    addressess:[addressSchema]
})


module.exports=mongoose.model('User',userScema)