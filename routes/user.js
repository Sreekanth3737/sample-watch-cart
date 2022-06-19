var express = require('express');
//const { response } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers=require('../helpers/user-helpers')
const categoryHelpers=require('../helpers/category-helpers')
const User=require('../models/userModel')
const Admin=require('../models/adminModel')
const Cart=require('../models/cartModel')
const config=require('../config/config')
const mongoose=require('mongoose');
const session = require('express-session');
const { response } = require('../app');
//const cartHelper=require('../helpers/cartHelper')


const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
 let user=req.session.user
  let cartCount=null
  let wishlistCount=null
  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
wishlistCount=await userHelpers.getWishlistCount(req.session.user._id)
}
  productHelpers.getAllProducts().then((products)=>{
   categoryHelpers.getCategory().then((result)=>{
productHelpers.getcategoryDropDown().then((categories)=>{
  categoryHelpers.getSubCategory().then((subcategories)=>{
    productHelpers.getBannerImages().then((bannerImg)=>{

      res.render('user/view-products',{products,user,cartCount,result,wishlistCount,categories,subcategories,bannerImg})


    })


  })
  

})
     
  })
})
});

router.get('/product-categories/:id',async(req,res)=>{
  let user=req.session.user
  let productCategories=await productHelpers.getCategoriesProducts(req.params.id)
   categoryHelpers.getSubCategory().then((productSubcategories)=>{

    res.render('user/product-categories',{user,productCategories,productSubcategories})

   })

})

router.get('/product-subcategories/:id',async(req,res)=>{
  let user=req.session.user
  let productSubcategories=await productHelpers.getSubcategoryProducts(req.params.id)
  res.render('user/product-subcategories',{user,productSubcategories})
})

router.post('/search',async(req,res)=>{
  let searchByText=req.body['searchname'];
  console.log(searchByText+'search=============');
  try {
    let user=req.session.user
    let getProductSearch=await productHelpers.getAllProducts()
    let categories=await productHelpers.getcategoryDropDown()
    let subcategories=await categoryHelpers.getSubCategory()
    if(searchByText){
      let products=getProductSearch.filter((p)=>p.brandnames.brand.includes(searchByText))
      res.render('user/view-products',{products,user,categories,subcategories})
    }
  } catch (error) {
     console.log(error);
  }
})


  

//get login
router.get('/login',(req,res)=>{
let admin=req.session.admin
//console.log("in get login page");
//console.log(req.session.user);
  if(req.session.user){

    res.redirect('/')
  }else if(req.session.admin){
    
    res.redirect('/admin')
  
}else{
    res.render('user/login',{'loginErr':req.session.loginErr})
    req.session.loginErr=false
  }

});

//get signup
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

////signup route
router.post('/signup',userHelpers.userSignup)

//get otp page
router.get('/verify-mail',(req,res)=>{
  if(req.session.user){
    res.redirect('/login')
  }else{
    res.render('user/verify-mail')
  }
  
})

router.post('/verify-mail',userHelpers.VerifyOTP)



///login route
router.post('/login',(req,res)=>{
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
 userHelpers.doUserLogin(req.body).then((response)=>{
   console.log(response.user+'responseeeeeeeeeeeeeeeee');
   if(response.user){
     req.session.loggedIn=true
     req.session.user=response.user
     //console.log("in login post");
     //console.log(req.session.user);
     res.redirect('/')
   }else if(response.admin){
    req.session.loggedIn=true
    req.session.admin=response.admin
    res.redirect('/admin')
   }else{
     req.session.loginErr="!- invalid username or password"
     res.redirect('/login')
   }
 })
});

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
});

//---------------whishlist--------------------
router.get('/wishlist',verifyLogin,async(req,res)=>{
  let user=req.session.user
  //let total=await userHelpers.totalAmount(user._id)

  let wishlistProducts=await userHelpers.getWishList(user);
  res.render("user/wishlist",{user,wishlistProducts})
})

router.get('/add-to-wishlist/:id',(req,res)=>{
  console.log("api call");
  userHelpers.addToWishList(req.params.id,req.session.user._id).then(()=>{
   // res.redirect('/')
    res.json({status:true})
  })

})
router.get('/delete-wishlist-product/:id',(req,res)=>{
  let proId=req.params.id
  let user=req.session.user._id
  userHelpers.deleteWishListProduct(proId,user).then(()=>{
    console.log(user+'delete-----------');

    res.redirect('/wishlist')
  })
})






//-------------whishlist end--------------------

//--------------get cart----------------------
router.get('/cart',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let products=await userHelpers.getCartProducts(req.session.user)
  //let total= userHelpers.getTotalAmount(req.session.user._id)
  let total=await userHelpers.totalAmount(user._id)
    
  console.log(total,"udufhbhbdhb");

    res.render('user/cart',{products,user,total})
  
 // console.log(products);
})

router.get('/add-to-cart/:id',(req,res)=>{
 // console.log("api call");
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    //res.redirect('/')
    res.json({status:true})
  })
});

//----------change product quantity-------------
router.post('/change-product-quantity',(req,res,next)=>{
       
  
 
  userHelpers.changeProductQuantity(req.body,req.session.user).then(async(response)=>{
    
  // response.total=await userHelpers.getTotalAmount(req.body.user)
    
  //   response.perTotal=await userHelpers.getPerTotelAmount(req.body)
    res.json(response)
    
    
  })
})



router.get('/delete-cart-product/:id',(req,res)=>{
  let proId=req.params.id
  let user=req.session.user._id
  userHelpers.deleteCartProduct(proId,user).then(()=>{
    res.redirect('/cart')
  })
})

// router.post('/clear-cart',(req,res)=>{
//  if(req.session.user){
//    userHelpers.deleteCart(req.body.usrId).then(()=>{
//      res.redirect('/cart')
//    })
//  }else{
//    res.redirect('/login')
//  }

// })

//////forget password//////
router.get('/forget-password',userHelpers.forgetPassword)


router.get('/reset-password-otp',userHelpers.verifyPasswordOtp)

router.get('/reset-password',userHelpers.resetPassword)

router.post('/forget-password',userHelpers.resetPassOtpSendToEmail)

router.post('/reset-password-otp',userHelpers.forgetPasswordOtp)

router.post('/reset-password',userHelpers.updateNewPassword)

//----------------product detail page-----------------------

router.get('/product-details-page/:id',async(req,res)=>{
let user=req.session.user
 if(user){

     let productDetails=await productHelpers.getAllProductDetails(req.params.id)
   //console.log(productDetails);

  
  res.render('user/product-details-page',{productDetails,user})
   }else{

     let productDetails=await productHelpers.getAllProductDetails(req.params.id)
    //console.log(productDetails);
     res.render('user/product-details-page',{productDetails})
   }
  
})

//---------------------------user Account-----------------
router.get('/user-profile/',verifyLogin,(req,res)=>{
  let user=req.session.user;
  if(req.session.user){
    res.render('user/user-profile',{user})
  }else{
    res.redirect('/')
  }
})
router.post('/user-profile/:id',verifyLogin,(req,res)=>{
  user=req.session.user
  userHelpers.updateUserDetails(req.params.id,req.body).then((response)=>{

    console.log(response);
    res.redirect('/')
  })
});


//--------------------user-address---------------------
router.get('/user-address',verifyLogin,async(req,res)=>{
  let user=req.session.user
  
  let total=await userHelpers.totalAmount(user._id)
  let address=await userHelpers.getAllAddress(user._id)
  
    res.render('user/user-address',{user,total,address})
 
})

router.post('/user-address',async(req,res)=>{
  let user=req.session.user
   userHelpers.saveAddress(req.body).then((response)=>{

    res.json({status:true})
   })
    
  console.log(req.body);
})


//---------------place-order----------------
router.get('/place-order/:id',async(req,res)=>{
let user=req.session.user;



  let total=await userHelpers.totalAmount(req.session.user._id)
let address=await userHelpers.sendUserAddress(req.params.id)

  res.render('user/place-order',{user,address,total})

console.log("hhhhhhhhhhhhhhhhaaaa"); 
})

router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let total=await userHelpers.totalAmount(req.body.userId)
  console.log(total.grandTotal.total);
  userHelpers.placeOrder(req.body,products,total).then((orderId)=>{
    console.log(orderId);
    if(req.body['payment-method']==='COD'){

      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,total).then((response)=>{

        res.json(response)
      })
      
    }


  })
  console.log(req.body,"---bodyyy");
})

//--------order-success-------------
router.get('/order-success',async(req,res)=>{
let user=req.session.user
  let total=await userHelpers.totalAmount(req.session.user._id)

  res.render('user/order-success',{user,total})
})

router.get('/view-orders',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let orders=await userHelpers.getUserOrder(req.session.user._id)
  
  console.log(orders);
  res.render('user/view-orders',{user,orders})
})


router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let user=req.session.user;
  let orderProducts=await userHelpers.getOrderProducts(req.params.id)
  let orderPrice=await userHelpers.getUserOrder(req.session.user._id)
  console.log(orderProducts+'amttttttttttt');
  console.log(orderPrice+'price======');

  res.render('user/view-order-products',{user,orderProducts,orderPrice})
})

router.post('/verify-payment',(req,res)=>{
  console.log(req.body,"---vrteth");
  userHelpers.verifyPayment(req.body).then(()=>{
 
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      
      console.log("payment successful");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:""})
  })
})




module.exports = router;
