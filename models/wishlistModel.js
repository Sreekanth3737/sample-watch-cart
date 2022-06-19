const mongoose=require('mongoose')
const wishlistSchema=new mongoose.Schema({

    // user:{type:mongoose.Schema.Types.ObjectId,
    //     ref:"Register",
    //     required:true 
    // },

    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:"Register",
    },
    wishlistItems:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
               
                ref:"Product",
                
                
            },
          
            price:{
                type:String

            },
            // catagory:{
            //     type:mongoose.Schema.Types.ObjectId,
            //     ref:'Category',
               
            //    },
            //     subcategory:{
            //         type:mongoose.Schema.Types.ObjectId,
            //         ref:'Subcatgory',
                    
            //     },
            
        }
    ],

    modifiedOn:{
        type:Date,
        default:Date.now
    }  


},{timestamps:true}
)

module.exports=mongoose.model("Wishlist",wishlistSchema)