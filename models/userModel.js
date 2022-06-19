const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    // lastname:{
    //     type:String,
    //     required:true
    // },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true

    },
    state:{
        type:String,
        required:true
    },
    block:{
        type:Boolean,
        default:false
    }

    
    
    

});
module.exports=mongoose.model('Register',userSchema)