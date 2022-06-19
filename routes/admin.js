var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const userHelpers= require('../helpers/user-helpers')
const Product=require('../models/productModel')
const categoryHelpers=require('../helpers/category-helpers')
const Brands=require('../models/brandModel')

const Category=require('../models/categoryModel')
var router = express.Router();
const multer =require('multer')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

router.get('/',verifyLogin,async(req,res,next)=>{
  admin=req.session.admin
const salesTable= await productHelpers.getAllOrders(req.session.admin)
  const orderCount=await  productHelpers.getAllOrdersCount(req.session.admin)
  const productCount=await productHelpers.getProductCount(req.session.admin)
   const totalIncome=await productHelpers.getTotalIncome(req.session.admin)
    const allUsers= await productHelpers.getUsersCount(req.session.admin)
           
 res.render('admin/admin-dashboard',{admin:true,salesTable,orderCount,productCount,totalIncome,allUsers})
          

})
/* GET admin listing. */
router.get('/view-products',verifyLogin, function(req, res, next) {
productHelpers.getAllProducts().then((products)=>{
//console.log(products);
  res.render('admin/view-products',{admin:true,products})

})
      
});
//----------------Add banner--------------

router.get('/add-banners', function(req, res) {
  
  admin=req.session.admin
  productHelpers.getBannerImages(req.session.admin).then((viewBannerImg)=>{


    console.log(viewBannerImg+'imageeeeeeeeeeis=======');

    res.render('admin/add-banners',{admin:true,viewBannerImg})
  })
   
  
  })
  

router.post('/add-banners',productHelpers.upload.single("image"),(req,res)=>{
   
productHelpers.addBanner(req.body,req.file.filename).then((id)=>{

res.redirect('/admin/add-banners')
})

})


router.get('/admin/delete-banner/:id',(req,res)=>{
 

  //console.log(proId);
  productHelpers.deleteBanner(req.params.id).then((response)=>{
    res.redirect('/admin/add-banners')
  })
});


//----------------Add product----------//
router.get('/add-product',async(req,res)=>{
  try {
    admin=req.session.admin
    const subCat=await categoryHelpers.getSubCategory()
    console.log(subCat+'subcatttttttttt');
    const brands=await productHelpers.getBrandDetails()
    const category=await categoryHelpers.getCategory()
    console.log(category+'cattttttttttttt');
    console.log();
    res.render('admin/add-product',{admin:true,subCat,brands,category})
  } catch (error) {
    console.log(error.message)
  }
})




router.post('/add-product',productHelpers.upload.fields([{name:"image",maxCount:1},{name:"images",maxCount:1}]),(req,res)=>{
  //console.log(req.files, "files");
  //console.log(req.body, "body");
  let mainImage=req.files.image[0].filename
  let nextImage=req.files.images[0].filename
  //console.log("dgfhfhd");
//console.log(req.body);
productHelpers.addProducts(req.body,mainImage,nextImage).then((id)=>{
  res.redirect('/admin/view-products')
})
})
 //-----------delete product---------------//
router.get('/delete-product/:id',(req,res)=>{

  let proId=req.params.id
  //console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view-products')
  })
});

//-------------Edit product-----------------//
router.get('/edit-product/:id',async(req,res)=>{
 // let data=req.params.id;
  const product=await productHelpers.getAllProductDetails(req.params.id)
    //Product.findOne({_id:data}).lean()
    const subcategoriDetails=await categoryHelpers.getSubCategory()
     
    res.render('admin/edit-product',{admin:true,product,subcategoriDetails})
   
  })
  //router.get('/edit-product/:id',productHelpers.getAllProductDetails)




router.post('/edit-product/:id',productHelpers.upload.fields([{name:"image",maxCount:1},{name:"images",maxCount:1}]),async(req,res)=>{
  const id=req.params.id 
  let productDetails=await Product.findById(id).lean()


 let mainImage=req.files.image?req.files.image[0].filename:productDetails.allImages[0].mainImage
 let nextImage=req.files.images?req.files.images[0].filename:productDetails.allImages[0].nextImage

  productHelpers.updateProduct(req.params.id,req.body,mainImage,nextImage).then(()=>{
    res.redirect('/admin/edit-product')
   
  })

})

//--------------All users-------//
router.get('/all-users',function(req,res){
  userHelpers.getAllUsers().then((users)=>{
    res.render('admin/all-users',{admin:true,users})
  })
  
})

//---------------Delete Users-----------
router.get('/delete-user/:id',(req,res)=>{
  let userId=req.params.id
 // console.log(userId)
  userHelpers.deleteUser(userId).then((response)=>{
    res.redirect('/admin/all-users')
  })
})

//--------------Add Category-----------

router.get('/add-category',(req,res)=>{
    res.render('admin/add-category',{admin:true})
})

router.post('/add-category',categoryHelpers.addCategory)

//------------------SubCategory-----------------

// router.get('/add-subcategory',categoryHelpers.getCategorys)
router.get('/add-subcategory',async(req,res)=>{
  const result=await categoryHelpers.getCategory()
  //console.log(result)
  res.render('admin/add-subcategory',{admin:true,result})
})


router.post('/add-subcategory',(req,res)=>{
  categoryHelpers.addSubCategory(req.body).then((data)=>{
   // console.log(data)
    res.redirect('/admin/add-subcategory')
  })
})

//-----------add Brands---------------

router.get('/add-brands',(req,res)=>{
  admin=req.session.admin
  res.render('admin/add-brands',{admin:true})
  // req.session.brandErr=null
  // req.session.brandmessage=null
})


//brandname post method
router.post('/add-brands',(req,res)=>{
  productHelpers.addBrandName(req.body).then((data)=>{
   console.log(data.message)
   req.session.brandmessage=data.message
    res.redirect('/admin/add-brands')
  }).catch((err)=>{
   // console.log(err.message)
    // req.session.brandErr=err.message
    //  res.redirect('/admin/add-brand')
  })

})


router.get('/view-all-orders',(req,res)=>{
  admin=req.session.admin
 productHelpers.getAllOrders(req.session.admin).then((adminOrders)=>{

  console.log(adminOrders);
  res.render('admin/view-all-orders',{admin:true,adminOrders})

 })

    
 
})

router.get('/orderstatus-shipped/:id', (req, res) => {
  admin=req.session.admin
   productHelpers.changeOrderStatusShipped(req.params.id).then(() => {
     res.redirect('/admin/view-all-orders')
   })
 })
 router.get('/orderstatus-delivered/:id', (req, res) => {
   admin=req.session.admin
  
  productHelpers.changeOrderStatusdelivered(req.params.id).then(() => {
     res.redirect('/admin/view-all-orders')
   })
 })

 router.get("/blockUser/:id", (req, res) => {
  const usrId = req.params.id; 
  
  console.log(usrId,"sdjfhusguasuashguahshasdgs=========");
  productHelpers.blockUser(usrId).then((response) => {
    res.json({status:true})
    });
});
router.get("/unBlockUser/:id", (req, res) => {
  const usrId = req.params.id;
  console.log(usrId,"esfhusayfuahiuashahsfhasdu");
  productHelpers.unBlockUser(usrId).then((response) => {  
  });
});

 



module.exports = router;
