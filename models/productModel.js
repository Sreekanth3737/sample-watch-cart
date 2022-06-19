const mongoose=require('mongoose');
const productSchema=new mongoose.Schema({
    // name:{
    //     type:String,
    //     required:true
    // },
   catagory:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Category',
   
   },
    subcategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subcatgory',
        
    },
    
    price:{
        type:String,
        required:true
    },
    order:{
        type:String,
        
    },
    stock:{
        type:Number,
        required:true
    },
    allImages:{
        type: Array,
        required: true
    },
    brandnames:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Brand",
        required:true
    },
    
    
    

},{timestamps:true}
);
module.exports=mongoose.model('Product',productSchema);