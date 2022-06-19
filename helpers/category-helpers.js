const db=require('../config/config');
const mongoose=require('mongoose')
const Category=require("../models/categoryModel")
const  SubCategory=require("../models/subCategoryModel")

const addCategory=async(req,res)=>{
    
    try {
        const category_data=await Category.find();
        if(category_data.length>0){

        let checking=false;
        for(let i=0;i< category_data.length;i++){
            if(category_data[i]['category'].toLowerCase()===req.body.category_name.toLowerCase()){

                checking=true;
                break;
            }
        }

        if(checking==false){
            const category=new Category({
                category:req.body.category_name
            });
             const cat_data=await category.save();
           // console.log(category);
            // res.status(200).send({sucess:true,msg:"category Data",data:cat_data});
                res.redirect('/admin/add-category')
        }

        else{
           res.status(200).send({sucess:true,msg:"this Category("+req.body.category+")is already exists."}) 
        }
    }else{
        const category = new Category({
            category:req.body.category_name
        })
        const category_datas = await category.save()
       // console.log(category_datas);
        res.redirect('/admin/add-category')
    } 
    

     
}
catch (error) {
        res.status(400).send({ success: false, message: error.message })
        console.log(error);
    }
}

const getCategory=()=>{
    return new Promise((resolve,reject)=>{
        Category.find().lean().populate('category').then((category_data)=>{
            resolve(category_data)
            //console.log(category_data)
        })
    })
}


const addSubCategory=(data)=>{
    try{
         return new Promise (async(resolve,reject)=>{
             const newcategory= await Category.findOne({subcategoryName:data.category_name})
             //console.log(newcategory)
             const newsubcategory = new SubCategory({
                subcategoryName: data.category_name,
                category:newcategory._id
            })
            await newsubcategory.save().then((data)=>{
                //console.log(data)
                resolve(data)
            })
         })
    }
    catch(error){
        console.log(error.message)
    }
}

const getSubCategory=()=>{
    return new Promise(async(resolve,reject)=>{
    const displaySubCatagory= await SubCategory.find().lean().populate('subcategoryName')
            resolve(displaySubCatagory)
            //console.log(displaySubCatagory)
    })
}
 




module.exports={addCategory,getCategory,addSubCategory,getSubCategory};