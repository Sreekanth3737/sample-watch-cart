const mongoose=require ('mongoose');
const orderSchema=new mongoose.Schema({
   
  
 
    
    
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
        
 
    
    

    products:[{type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
    }],
    userId:{type:mongoose.Schema.Types.ObjectId,
      ref:"Register",
     
  }, 
  totalAmt:{
      type:Number,
  },
  paymentMethod:{
      type:String,
  },
  status:{
      type:String,
  },
  date:{
      type:String,
      default:Date.now
  },

},{timestamps:true}
)

module.exports=mongoose.model("Order",orderSchema)