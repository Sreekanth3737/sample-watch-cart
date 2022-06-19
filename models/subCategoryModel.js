const mongoose=require('mongoose')

const subcategorySchema=new mongoose.Schema({
    subcategoryName:{
        type:String,
       
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        
    }

})

module.exports=mongoose.model('Subcatgory',subcategorySchema)