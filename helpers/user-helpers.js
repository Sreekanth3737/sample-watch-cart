
const mongoose=require('mongoose')
const User=require('../models/userModel')
const Admin=require('../models/adminModel')
const Cart=require('../models/cartModel')
const Product=require('../models/productModel')
const Address=require('../models/addressModel')
const Orders=require('../models/order')
const Wishlist=require('../models/wishlistModel')
const bcrypt=require('bcrypt');
const db=require('../config/config')
const nodemailer=require('nodemailer')
const { response } = require('../app')
const categoryModel = require('../models/categoryModel')
const { promises } = require('nodemailer/lib/xoauth2')
const Razorpay=require('razorpay')
const momment=require('moment')
const { resolve } = require('path')

//const async = require('hbs/lib/async');
let instance=new Razorpay({
    key_id:'rzp_test_bAry8hlQGMmmX4',
    key_secret:'Dr5b6GNLGm0sk4C2n9IDjUpN',
});


const securePassword=async(Password)=>{
    try {
      const passwordHash= await bcrypt.hash(Password,10);
      return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

// create user start
const userSignup = async (req, res) => {

    try {

        const spassword = await securePassword(req.body.password);
        const user = new User({
          

        name:req.body.name,
         //lastname:req.body.lastname,
         mobile:req.body.mobile,
         email:req.body.email,
         password:spassword,
         address:req.body.address,
         pincode:req.body.pincode,
         city:req.body.city,
         state:req.body.state,
    });
        
        req.session.userDetials = user
      
        console.log(user);

        const otpGenerator = Math.floor(1000 + Math.random() * 9000);
        console.log(otpGenerator);
        req.session.OTP = otpGenerator;
        
        if (user) {
            sendVerifyMail(req.body.name, req.body.email,otpGenerator)
            res.redirect('/verify-mail');

        } else {
            res.redirect('/signup');

        }

    } catch (error) {
        console.log(error.message);
    }

}

// create user end



// send otp verification mail start
const sendVerifyMail = async (name,email,otpGenerator) => {

  try {
      const mailTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          service: "gmail",
          port: 587,
          secure: true,
          auth: {
              user: "watchcart3265@gmail.com",
              pass: "iztxqgdkypnqafqj"
          },
          tls: {
              rejectUnauthorized: false
          }

      });

      const mailDetails = {
          from: "watchcart3265@gmail.com",
          to: email,
          subject: "for user verification",
          text: "just random texts ",
          html: '<p>hi ' + name + 'your otp ' + otpGenerator + ''
      }
      mailTransporter.sendMail(mailDetails, (err, Info) => {
          if (err) {
              console.log(err);
          } else {
              console.log("email has been sent ", Info.response);
          }
      })
  } catch (error) {
      console.log(error.message);
  }

}
// send otp  mail end

// verify otp
const VerifyOTP = async (req, res) => {

  let userOTP = req.body.otp
  let validOtp = req.session.OTP
  let userDetials = req.session.userDetials

  try {
      if (validOtp == userOTP) {
          const user = new User({
            name:userDetials.name,
             //lastname:userDetials.lastname,
             mobile:userDetials.mobile,
             email:userDetials.email,
             password:userDetials.password,
             address:userDetials.address,
             pincode:userDetials.pincode,
             city:userDetials.city,
             state:userDetials.state
          });
          const userData = await user.save();
          req.session.userLoggedIn = true
          req.session.user = userData
           req.session.userDetials = null
           req.session.OTP = null
          res.redirect("/login")
      } else {
          req.session.ErrOtp = "Invalid OTP !!!"
          res.redirect("/verify-mail")
      }


  } catch (error) {
      console.log(error);
  }
}

//forget password code start

// get forgot password
const forgetPassword = async (req, res) => {

    try {

        res.render("user/forget-password", { admin: false, mailMsg: req.session.checkMailMsg, Errmsg: req.session.checkMailErr })
        req.session.checkMailMsg = false
        req.session.checkMailErr = false
    } catch (error) {
        console.log(error);
    }
}

//reset -password otp

const verifyPasswordOtp=async(req,res)=>{
    try {
        res.render('user/reset-password-otp',{admin:false})
    } catch (error) {
       console.log(error); 
    }
}

//reset-password

const resetPassword=async(req,res)=>{
    try {
        res.render('user/reset-password',{admin:false})
    } catch (error) {
        console.log(error);
    }
}



// reset password otp send to Email                                              
const resetPassOtpSendToEmail = async (req, res) => {

  try {

      const email = req.body.email;
      const userResetData = await User.findOne({ email: email });
      req.session.userResetid = userResetData._id;

      if (userResetData) {
        //   const validRandomString = randomString.generate();
        //   req.session.randomString = validRandomString;
        const otpGenerator = Math.floor(1000 + Math.random() * 9000);
        console.log(otpGenerator);
        req.session.OTP = otpGenerator;

          sendPasswordResetMail(userResetData.firstname, userResetData.email, otpGenerator)

          req.session.checkMailMsg = "Check your Email to reset your password"
          res.redirect("/reset-password-otp")


      } else {

          req.session.checkMailErr = "Invalid Email Id"
          res.redirect("/forget-password")
      }


  } catch (error) {
      console.log(error);
  }
} 


// send reset password mail start
const sendPasswordResetMail = async (name, email, otpGenerator) => {

  try {
      const mailTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          service: "gmail",
          port: 587,
          secure: true,
          auth: {
              user: "watchcart3265@gmail.com",
              pass: "iztxqgdkypnqafqj"
          },
          tls: {
              rejectUnauthorized: false
          }

      });

      const mailDetails = {
          from: "watchcart3265@gmail.com",
          to: email,
          subject: "Reset Password",
          text: "hai your otp is please verify " +otpGenerator+'',
          //html: '<p>Hi ' + firstname + ' click <a href ="http://localhost:3000/user/reset-password?tocken=' + tocken + '"> here to </a> to reset your password</p>'
      }
      mailTransporter.sendMail(mailDetails, (err, Info) => {
          if (err) {
              console.log(err);
          } else {
              console.log("email has been sent ", Info.response);
          }
      })
  } catch (error) {
      console.log(error.message);
  }

}

// send reset password mail end


//------------forget password verify otp---------------
const forgetPasswordOtp=async(req,res)=>{
    let userOtp=req.body.fotp
    let userNewOtp=req.session.OTP
    try {
        if(userNewOtp==userOtp){
            res.redirect('/reset-password')
        }else{
            res.redirect('/forget-password')
        }
    } catch (error) {
        console.log(error);
    }
}


// update the user password
const updateNewPassword = async (req, res) => {

  try {
      const newPassword = req.body.password
      const resetId = req.session.userResetid
      const newSecurePassword = await securePassword(newPassword);
      const updatedUserData = await User.findByIdAndUpdate({ _id: resetId }, { $set: { password: newSecurePassword } })
      req.session.randomString = null;
      req.session.userResetid = null;   
      req.session.resetSuccessMsg = "Your password updated successfully.."
      res.redirect("/login")
     

  } catch (error) {
      console.log(error.message);
  }
}
//forget password code end



const addToWishList=async(productId,userId,quantity)=>{
    
    return new Promise(async(resolve,reject)=>{

        

        let userWishlist=await Wishlist.findOne({userId:userId})
        
    

       if(userWishlist){
            
           
           const prodExist=  userWishlist.wishlistItems.findIndex(product=>product.product==productId)
           //console.log(prodExist)
           if(prodExist!=-1){
        //    {
        //        Wishlist.updateOne({userId:userId,'wishlistItems.product':productId},
        //        {
        //            $inc:{'wishlistItems.$.quantity':1},
                  
                   
        //         }
        //         ).then((response)=>{
        //            resolve()
        //             console.log(response);
        //        })
        //    }
         }else  {
                Wishlist.updateOne({userId:userId},{$push:{wishlistItems:[{product:productId}]}}).then((response)=>{
                    resolve()
                })
            }
           
            }
       else{
          let wishlistObj={
            userId:userId,
              wishlistItems:[{product:productId}]
          }
         Wishlist.create(wishlistObj).then((response)=>{
              resolve()
          })
       }
    })
}

const getWishList=(userId)=>{
    console.log(userId+'original user===============');
    return new Promise(async(resolve,reject)=>{
        let wishListItems=await Wishlist.find({userId:userId}).lean().populate({path:'wishlistItems.product',populate:{path:'brandnames'}}).populate({path:'wishlistItems.product',populate:{path:'subcategory'}}).populate({path:'wishlistItems.product',populate:{path:'catagory'}})
        
        resolve(wishListItems)
    })
}

const getWishlistCount=(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count=0;
        let wishlist=await Wishlist.findOne({userId:userId})
       
        if(wishlist){
            count=wishlist.wishlistItems.length
        }
        resolve(count)
        console.log(count+'wishlist count=========');
    })
}

const deleteWishListProduct=(proId,usrId)=>{
    return new Promise((resolve,reject)=>{
        Wishlist.updateOne(
            {userId:usrId},
            {
                $pull:{
                    wishlistItems:{
                        product:proId
                    }
                }
            }
        ).then((response)=>{
            resolve(response)
        });
    });
}



//-------------add to Wishlist end-------------------


//-----------------addto cart-----------------------

const addToCart=async(productId,userId,quantity)=>{
    


    return new Promise(async(resolve,reject)=>{

        let totalObj=await Product.findOne({_id:productId});
        let perTotal=totalObj.price;
        let qtyObj=await Cart.findOne({user:userId})

        let userCart=await Cart.findOne({user:userId})
    //    //console.log(userCart+'nnnnnnnnn')
    //    let qty = qtyObj.cartItems[0].quantity;

       var subtotal=perTotal

       if(userCart){
             if(userCart.cartItems[0]){
              let qty = qtyObj.cartItems[0].quantity;
              var subtotal=perTotal * qty
             }
           
           const prodExist= userCart.cartItems.findIndex(product=>product.product==productId)
           console.log(prodExist)
           if(prodExist!=-1)
           {
               Cart.updateOne({user:userId,'cartItems.product':productId,user:userId},
               {
                   $inc:{'cartItems.$.quantity':1,'cartItems.$.subtotal':perTotal},
                  
                   //$set: { "cartItems.$.subtotal": subtotal},
                }
                ).then((response)=>{
                   resolve()
                    console.log(response);
               })
           }
            else{
                Cart.updateOne({user:userId},{$push:{cartItems:[{product:productId,quantity,subtotal}]}}).then((response)=>{
                    resolve()
                })
            }
           
            }
       else{
          let cartObj={
              user:userId,
              cartItems:[{product:productId,quantity,subtotal}]
          }
          Cart.create(cartObj).then((response)=>{
              resolve()
          })
       }
    })
}

const getCartProducts=(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let cartItems=await Cart.find({user:userId}).lean().populate({path:'cartItems.product',populate:{path:'brandnames'}})
        // const cartItemsToArray = Object.values(cartItems);
        //  console.log(cartItemsToArray+'qqqqqqqqqqqqqqq');
        resolve(cartItems)
         
        
    })
}

//-----------get cart count---------------
const getCartCount=(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count=0;
        let cart=await Cart.findOne({user:userId})
        if(cart){
            count=cart.cartItems.length
        }
        resolve(count)
    })
}

//--------change cart quantity----------



//---------update user profile----------
const updateUserDetails=(userId,userDetials)=>{
    return new Promise (async(resolve,reject)=>{

        let updateUser=await User.updateOne({_id:userId},{
           name:userDetials.name,
           // lastname:userDetials.lastname,
            mobile:userDetials.mobile,
            email:userDetials.email,
            address:userDetials.address,
            city:userDetials.city,
            pincode:userDetials.pincode,
            state:userDetials.state
            

        }).then((updateUser)=>{
            resolve()
        })
    })
}

//------------------add multiple address-------------------
const addMultipleAddress=async (req,res)=>{
    try {
        const address=new Address({
            user_id:req.body.user_id,
            address:req.body.address,
            pin:req.body.pin,
            mobile:body.mobile
        })
    } catch (error) {
        console.log(error);
    }
}





module.exports={
  
userSignup,VerifyOTP,forgetPassword,verifyPasswordOtp,resetPassword,resetPassOtpSendToEmail,updateNewPassword,forgetPasswordOtp,addToCart,getCartProducts,getCartCount,updateUserDetails,addToWishList,getWishList,getWishlistCount,deleteWishListProduct,

    doUserLogin:(userData)=>{
        //console.log(userData);
      return new Promise (async(resolve,reject)=>{
          let loginStatus=false;
          let response={}
          let admin= await Admin.findOne({email:userData.email})
          let userName = await User.findOne({email:userData.email})
          console.log(userName+'user11111111111111');
          if(userName){
              console.log(userName.block+'user============');
              if(userName.block){
                console.log('User Login failed************');
                resolve({status:true})  
                
              }else{
                bcrypt.compare(userData.password,userName.password).then((status)=>{
                    if(status){
                      console.log('Login sucess=============');
                      response.user=userName
                      // console.log(useremail)
                      response.status=true
                      resolve(response)
                    }else{
                        console.log('User Login failed+++++++++');
                        resolve({status:false})
                      }
                  })
                
                  

              }
            
          }else if(admin){
            if(userData.password==admin.password){
                console.log("Admin LoggedIn");
                response.admin=admin
                response.status=true
                resolve(response)
              }else{
                console.log("Admin Login Failed");
                resolve({status:false})
              }
            
            }else {
              console.log('Invalid UserId or Password');
              resolve({status:false})
            } 
          
      }) 
        
    },

    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await User.find().lean()
            resolve(users)
            
        })
      },
      
      deleteUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            User.deleteOne({_id:userId}).then(()=>{
                resolve()
            })
        })
    },
//---------------change cart quantity--------
changeProductQuantity:async (details)=>{
       
    let quantity=parseInt(details.quantity);
   let count=parseInt(details.count);
    let product=await Product.findOne({_id:details.product
    });
console.log(product+'dhhdhhh');
    let price=parseInt(product.price);
    console.log(price+'hgggggggggggg');
    return new Promise((resolve,reject)=>{
        if(count==-1 && quantity==1){
          Cart.updateOne({"cartItems._id":details.cart},
               
                {
                    $pull:{
                       cartItems:{
                         product:details.product  
                       },
                    }
                }

                ).then((response)=>{
                    resolve({removeProduct:true})
                });
        }else{
           if(count==1){

           
               
                let qty=quantity + 1;

                let subtotal=qty * price;
                Cart.updateOne({"cartItems._id":details.cart,"cartItems.product":details.product},
                
                {
                    $inc:{"cartItems.$.quantity":count},
                    $set:{"cartItems.$.subtotal":subtotal}
                }
                ).then((response)=>{
                    resolve({status:true})
                })
            }else{
                let qty=quantity-1;
                let subtotal=qty * price;
                Cart.updateOne({"cartItems._id":details.cart,"cartItems.product":details.product},
                
                {
                    $inc:{"cartItems.$.quantity":count},
                    $set:{"cartItems.$.subtotal":subtotal}
                }
                ).then((response)=>{
                    resolve({status:true})
                })
            }  
        }
    })
},
    //--------------delete cart product----------
    deleteCartProduct:(proId,usrId)=>{
        return new Promise((resolve,reject)=>{
            Cart.updateOne(
                {user:usrId},
                {
                    $pull:{
                        cartItems:{
                            product:proId
                        }
                    }
                }
            ).then((response)=>{
                resolve(response)
            });
        });
    },
 
    
   //------------get-sub total-------------

   totalAmount:(userId)=>{
       return new Promise(async(resolve,reject)=>{
       let cart=Cart.findOne({user:userId}) 
      let id=mongoose.Types.ObjectId(userId)
       if(cart){

        let totalAmt=await Cart.aggregate([
               {
                   $match:{user:id},
               },
               {
                   $unwind:"$cartItems",
               },
               {
                   $project:{
                       
                       subtotal:"$cartItems.subtotal",
                       shipping:"$cartItems.shipping"
                   },
                   
               },
               {
                    $project:{
                        subtotal:1,
                        shipping:1,
                    },
               },
            
               
               {
                   $group:{
                       _id:null,
                       totals:{$sum:"$subtotal"},
                       ship:{$sum:"$shipping"}
                   }
               },
               {
                   $addFields:{
                    total:{$sum:["$totals","$ship"]}
                   }
               },
           ])
           //console.log(total+'total total');
           if(totalAmt.length==0){
               resolve({status:true});
    
           }else{
               let grandTotal=totalAmt.pop();
              let finalAmt= await Cart.findOneAndUpdate({user:userId},{$set:{total:grandTotal.total}})
               resolve({grandTotal})
               
               console.log(grandTotal,"grandTotal");
               console.log(finalAmt);
           }
       }
       

       });

   },
//-------------user-multiple-addresss-------------
   saveAddress:(details)=>{
        return new Promise(async(resolve,reject)=>{
            
            //let status=details['payment-method']==='COD'?'placed':'pending'
            let address=await Address.findOne({user:details.userid})
            //console.log(address+'yyyyyyyyyyyrr');

            if(address){

                Address.updateOne({user:details.userid},{$push:{userAddress:[{name:details.name,
                    mobile:details.mobile,
                    pincode:details.pincode,
                    address:details.address,
                    city:details.city,
                    state:details.state}]}}).then((response)=>{
                        resolve()
                    })


            }else{

                let userObj={user:details.userid,
                    userAddress:[{
                   
                        name:details.name,
                        mobile:details.mobile,
                        pincode:details.pincode,
                        address:details.address,
                        city:details.city,
                        state:details.state
                       
                    }],
                    //user:details.userid
                    
                }
                Address.create(userObj).then((response)=>{
                    resolve()
                })
    

            }
                        

         })
    
   },
//-----------getAll Address in address select page------------------
    getAllAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let address=await Address.find({user:userId}).lean().populate('userAddress')
            resolve(address)
        })

    },

//----------send user Address to place order------------

   sendUserAddress:(addressId)=>{
       console.log(addressId,+"-----------------");
       return new Promise(async(resolve,reject)=>{
           //let userAddress=await Address.findOne({addressId}).lean()
           let id=mongoose.Types.ObjectId(addressId)
           const addressDetails=await Address.aggregate([
               {
                   $unwind:"$userAddress"
               },
               {
                   $match:{"userAddress._id":id}
               }
           ]
              
           )
           resolve(addressDetails[0])
console.log(addressDetails[0]);
       })
   },
//-------------place-order---------------
   placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total,+'totallllllllllllllllllllllllllll');
            let status=order['payment-method']==="COD"?"placed":"pending"
            //let discount=(order.total*5)/100;
            let orderObj={
                
               
                    name:order.name,
                    mobile:order.mobile,
                    pincode:order.pincode,
                    address:order.address,
                    city:order.city,
                    state:order.state,
                   
              

                userId:order.userId,
                paymentMethod:order['payment-method'],
                products:products,
                totalAmt:total.grandTotal.total,
                status:status,
                date:momment().format('DD-MM-YYYY')
                
            }

            Orders.create(orderObj).then((response)=>{
                Cart.deleteOne({userId:order.userId}).then((response)=>{
                    resolve(response)
                })
                console.log("order id :",response._id);
                resolve(response._id)
            })
        })
   },

   //------------get product details------------------
   getCartProductList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        id=mongoose.Types.ObjectId(userId)
        let cart=await Cart.aggregate([
            {
                $match:{
                    user:id
                },
            },
            {
                $unwind:'$cartItems'
                    
                
            },
            {
                $project:{
                    _id:'$cartItems.product'
                }
            }
        ])
        console.log(cart);
        resolve(cart)
    })
},

//------------view -orders----------------
getUserOrder:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        //console.log(userId);
        let orders=await Orders.find({userId:userId}).populate({path:'products',populate:{path:'brandnames'}}).populate({path:'products',populate:{path:'subcategory'}}).populate({path:'products',populate:{path:'catagory'}}).populate({path:'products',populate:{path:'catagory'}}).populate('totalAmt').lean()
        console.log(orders);
        resolve(orders)
    })
},
//-------------get Order Products--------------
getOrderProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
 // let id=mongoose.Types.ObjectId(orderId)    
let orderItems=await Orders.find({_id:orderId}).populate({path:'products',populate:{path:'brandnames'}}).populate({path:'products',populate:{path:'subcategory'}}).populate({path:'products',populate:{path:'catagory'}}).populate('totalAmt').lean()

resolve(orderItems)
console.log(orderItems);
    })
},

generateRazorpay:(orderId,total)=>{
    return new Promise(async(resolve,reject)=>{
        console.log(orderId);
        console.log(total);
        let options={
            amount:total.grandTotal.total*100,
            currency:'INR',
            receipt:""+orderId
        };
        instance.orders.create(options,function(err,order){
            if(err){
                console.log(err);
            }else{

            
            console.log("New Order :",order);
            resolve(order)
            }
        })
    })
},

verifyPayment:(details)=>{
    //console.log(details,"dddddddddddd");
    
    return new Promise(async(resolve,reject)=>{
        const crypto=require('crypto')
        const { createHmac } = await import('node:crypto');
        let hash = createHmac('sha256','Dr5b6GNLGm0sk4C2n9IDjUpN')
        hash.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
       hash= hash.digest('hex');
       
       if(hash==details['payment[razorpay_signature]']){
         
            resolve(response)
       }else{
           reject()
       }
    })
},

changePaymentStatus:(orderId)=>{
    //console.log(orderId,'idddddddddddddd');
    return new Promise(async(resolve,reject)=>{
        Orders.updateOne({_id:orderId },
            {
                $set:{
                    status:"Ordered"
                }
            }
            ).then(()=>{
                resolve()
            })
    })
}
   
    
}


