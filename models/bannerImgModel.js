const mongoose=require('mongoose');
const bannerScheema=new mongoose.Schema({
  
    img:{type: String},

    description:{
        type:String,

    }
 
},{timestamps:true}
);
module.exports=mongoose.model('Banner',bannerScheema);