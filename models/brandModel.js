const mongoose = require('mongoose');


const brand = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

})


module.exports=mongoose.model('brand',brand);