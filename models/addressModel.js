const mongoose=require ('mongoose');
const addressSchema=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,
        ref:"Register",
       
    },   
    
    
   userAddress:[
       { 
       
           name:{
               type:String,
               required:true,
           },
          address:{
               type:String,
               required:true,
           },
           city:{
                type:String,
                required:true,
           },
           state:{
                type:String,
                required:true,
           },
           pincode:{
               type:String,
               required:true,
           },
          mobile:{
               type:String,
               required:true,
           },
           date:{
            type:Date,
            default:Date.now
        },
    
       
       },],
       
       

        

       
   
},{timestamps:true}
);
module.exports=mongoose.model("Address",addressSchema)