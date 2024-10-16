const mongoose = require("mongoose");



const imageSchema = mongoose.Schema({
        url: { type: String, required: true },
        altText: { type: String, required: true }
    
})




const varientSchema = mongoose.Schema({
    color: {
        type: {
            color: { type: String, required: true },
            colorCode: { type: String }
        },
        required: true
    },
    stock:{
        type:Number,
        required:true,
        min:0
    },
    images:[imageSchema]

})













const productSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },


    isDeleted:{
        type:Boolean,
        default:false
    },createdAt: {
        type: Date,
        default: Date.now
    },updatedAt: {
        type: Date,
        default: Date.now
    },description: {
        type:String,
        required:true
    },specification:[{
        key:{type:String , required:true},
        value:{type:String , required:true}
    }],
    varients:[varientSchema],
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
      }
   

})


module.exports=mongoose.model('Product', productSchema);



