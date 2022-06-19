const mongoose=require('mongoose')

const categorySchema= mongoose.Schema({
    
    category:{
        type:String,
       
    },
    // subcategoryName:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"Subcatgory"
    // }
});

module.exports=mongoose.model("Category",categorySchema)