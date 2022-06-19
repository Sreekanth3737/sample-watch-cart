//const { promiseCallback } = require('express-fileupload/lib/utilities');
//const async = require('hbs/lib/async');
//const { Promise } = require('mongoose');
const db=require('../config/config');
const multer =require('multer')
const SubCatagory=require('../models/subCategoryModel')
const Brands=require('../models/brandModel')
const Banner=require('../models/bannerImgModel')
const User=require('../models/userModel')
const Order=require('../models/order')
const Category=require('../models/categoryModel')
const Product=require('../models/productModel');
const { response } = require('../app');


//multer
const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        
        cb(null,'./public/images')
    },
    
    filename:function(req,file,cb){

       cb(null,Date.now()+'--'+file.originalname)
    }
  });
  const upload= multer({storage:storage})

  //---------add banner images----------------------
  const addBanner=(adminBanner,banner_i)=>{
      return new Promise(async(resolve,reject)=>{
          let banner_img=banner_i
          
          const bannerImg=await new Banner({
           img:banner_img,
           description:adminBanner.description
          })
          
          await bannerImg.save().then((data)=>{
            console.log(data);
            resolve(data)
        })
      })
  }

  const getBannerImages=()=>{
    return new Promise(async(resolve,reject)=>{
        const bannerImage=Banner.find().lean()
        resolve(bannerImage)
    })

  }

  const deleteBanner=(bannerId)=>{
      return new Promise((resolve,reject)=>{
           Banner.deleteOne({_id:bannerId}).then((response)=>{
              resolve(response)
          })
      })
  }

//--------add-products---------------------------------
const addProducts=(adminProduct,mainImage,nextImage)=>{
    //console.log("dhbhb");
    return new Promise(async(resolve,reject)=>{
        const subcategories= await SubCatagory.findOne({subcategoryName:adminProduct.subcategory})
        console.log(subcategories+'subcategoriesssssss');
        const catagory=await Category.findOne({category:adminProduct.category})
        console.log(catagory+'catagoryyyyyyyyyyy');
       const brand=await Brands.findOne({brand:adminProduct.brandname})
        let main_i=mainImage
        let next_i=nextImage
        const product=await new Product({
           
           
            subcategory:subcategories._id,
            catagory:catagory._id,
            brandnames:brand._id,
            price:adminProduct.price,
            stock:adminProduct.stock,
            allImages:[main_i,next_i]
            
            
        })
        await product.save().then((data)=>{
            console.log(data);
            resolve(data)
        })
    })
}

//----------------edit-------
const  getAllProductDetails=(proId)=>{
    return new Promise((resolve,reject)=>{
        
        //Product.findOne({_id:proId}).lean().then((product_info)=>{
            const getproductdetails=Product.findOne({_id:proId}).populate({path:'subcategory',populate:{path:'subcategoryName'}}).populate('brandnames').lean()
            //console.log(getproductdetails+'gffffffffffff')
            resolve(getproductdetails)

            //resolve(product_info)
           // console.log(product_info)
            
        })
         
        
   // })
} 

const updateProduct=(proId,proDetails,mainImage,nextImage)=>{
    return new Promise(async(resolve,reject)=>{
        const subcategories= await SubCatagory.findOne({subcategoryName:proDetails.subcategory})

       let maini=mainImage
          let nexti=nextImage
        
      Product.updateOne({_id:proId},{
        $set:{
            name:proDetails.name,
            subcategory:subcategories._id,
            price:proDetails.price,
            stock:proDetails.stock,
            allImages:[maini,nexti]
        }
      }).then((response)=>{
        resolve()
      })
    })
  }

  //-----------------add brand--------------------


  //brandname post

  const addBrandName=(brandnames)=>{
    return new Promise(async(resolve,reject)=>{
        const brands=await Brands.findOne({brand:brandnames.brandname})
        
        if(brands){
            reject({status:false,message:"brandname already exist"})
        }
        else{
             const brand=new Brands({
            brand:brandnames.brandname
        })
          await brand.save((err,result)=>{
              if(err){
                  reject({status:false,message:"brandname is not added"})
              }else{
                  resolve({status:true,message:'brandname added successfully'})
              }
          })
        }

       
        

    })

 }

//  //brand details get
 const getBrandDetails=()=>{
    return new Promise(async(resolve,reject)=>{
        let brand=await Brands.find({}).lean()
        resolve(brand)
    })
}




module.exports={upload,updateProduct,getAllProductDetails,
    addProducts,addBrandName,getBrandDetails,addBanner,getBannerImages,deleteBanner,
   getAllProducts:()=>{
       return new Promise(async(resolve,reject)=>{
           let products=await Product.find({}).populate('brandnames').populate({path:'subcategory',populate:{path:'subcategoryName'}}).populate({path:'catagory',populate:{path:'category'}}).lean().then((products)=>{
            
            //console.log(products);
            resolve(products)

        })
           
       })
   },
   deleteProduct:(proId)=>{
    return new Promise((resolve,reject)=>{
        Product.deleteOne({_id:proId}).then((response)=>{
            resolve(response)
        })
    })
},

getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
      let allOrders=await Order.find().populate({path:'products',populate:{path:'brandnames'}}).populate('userId').lean()
  resolve(allOrders)
  console.log(allOrders);
    })
},
getAllOrdersCount:()=>{
    return new Promise(async(resolve,reject)=>{
        let allOrder=await Order.count().lean()
        resolve(allOrder)
        console.log(allOrder);
    })
},
getUsersCount:()=>{
return new Promise(async(resolve,reject)=>{
    let allUsers=await User.count()
    resolve(allUsers)
})
},
getProductCount:()=>{
    return new Promise(async(resolve,reject)=>{
        let allProduct=await Product.count()
        resolve(allProduct)
    })
},

getTotalIncome:()=>{
    return new Promise(async(resolve,reject)=>{
        let totalIncome=await Order.aggregate([
            {
                $group:{
                    _id:null,
                    total:{
                        $sum:'$totalAmt'
                    }
                }
            }
        ])
        let sum=totalIncome[0].total
        resolve(sum)
    })
},


getcategoryDropDown:()=>{
    return new Promise(async(resolve,reject)=>{
   const displayCategoryDropDown=await Category.find().populate('category').lean()
            resolve(displayCategoryDropDown)
            console.log(displayCategoryDropDown+'dropdownnnnnnnnnnnnnnnn');
        
    })
},

getCategoriesProducts:(categoryId)=>{
    return new Promise(async(resolve,reject)=>{
      Product.find({catagory:categoryId}).lean().populate('subcategory').populate('catagory').populate('brandnames').then((productDetails)=>{

            resolve(productDetails)
            console.log(productDetails+'cat++++++++++++++++++');
        })
    })
},



getSubcategoryProducts:(subcaegoryId)=>{
    return new Promise(async(resolve,reject)=>{
        Product.find({subcategory:subcaegoryId}).populate('subcategory').populate('catagory').populate('brandnames').lean().then((productDetails)=>{
            resolve(productDetails)
            console.log(productDetails);
        })
    })
},

changeOrderStatusShipped:(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await Order.findByIdAndUpdate({_id:orderId},{
            $set:{status:'shipped'}
        })
         resolve(order)
       
       
    })
},

 changeOrderStatusdelivered:(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await Order.findByIdAndUpdate({_id:orderId},{
            $set:{status:'delivered'}
        })
         resolve(order)
       
       
    })
},


 blockUser: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: true } },
        {upsert:true}
      );
      resolve(user);
      console.log(user+'wwwwwwwwwwwwwwwww');
    });
  },
  
  unBlockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: false } },
        {upsert:true}
        
      );
      resolve(user);
      console.log(user);
    });
  },




}
