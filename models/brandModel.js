const mongoose=require('mongoose')

const brandSchema=mongoose.Schema({
    brand:{
        type:String,
        
    }
});

module.exports=mongoose.model("Brand",brandSchema)