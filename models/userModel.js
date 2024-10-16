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
        required:false
    },
    password:{
        type:String,
        required:false
    },
    confirmPassword:{
        type:String,
        required:false
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
    addressess:[addressSchema],
    wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    createdAt: {
        type: Date,
        default: Date.now
    }
  }],
  walletBalance: {
    type: Number,
    default: 0
  },
  walletTransactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit']
    },
    amount: Number,
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
})


module.exports=mongoose.model('User',userScema)