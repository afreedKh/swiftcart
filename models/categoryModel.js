const mongoose = require("mongoose");

const category = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },createdAt: {
        type: Date,
        default: Date.now
    }
    
})


module.exports=mongoose.model('category',category)
