const mongoose=require('mongoose')
const cartSchema=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,
        ref:"Register",
        required:true 
    },
    cartItems:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
               
                ref:"Product",
                
                
            },
            subtotal:{
                type:Number,
                default:0

                
            },
            shipping:{
                type:Number,
                default:50,
            },
            price:{
                type:String

            },
            
        
    
            quantity:{
                type:Number,
                default:1
               
            },
            
        }
        
    ],
        
    total:{
        type:Number,
       default:0,
    
        
    },         
    

        
    
    

    
    modifiedOn:{
        type:Date,
        default:Date.now
    }  

   
},{timestamps:true}
)

module.exports=mongoose.model('Cart',cartSchema)