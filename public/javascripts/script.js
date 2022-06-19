// const { response } = require("../../app")

const { response } = require("../../app");

function addToCart(proId){
      $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
          //alert(response)
        }
      })
    }

    function addToWishlist(proId,userId){
      console.log(proId);
      console.log(userId);
      $.ajax({
        url:'/add-to-wishlist/'+proId,
        method:'get',
        success:(response)=>{
          if(response.status){
            let count=$('#wishlist-count').html()
            count=parseInt(count)+1
            $('#wishlist-count').html(count)
          }
        }
      })
    }

    function changeWishlistQuantity(userId,proId,count,wishlistId){
      //let quantity=parseInt(document.getElementById(proId).value);
      count=parseInt(count)
      $.ajax({
        url:'/change-wishlist-quantity',
        data:{
          userId:userId,
          wishlist:wishlistId,
          product:proId,
          count:count,
        },
        method:"post",
        success:(response)=>{
          if(response){
            location.reload()
          }else{
            document.getElementById().value+=count
          }
        }
      })
    }

    
  function changeQuantity(cartId,proId,userId,count){
    let quantity = parseInt(document.getElementById(proId).value);
    count=parseInt(count)
    let price=parseInt(document.getElementById('price'+ proId).innerHTML)
    $.ajax({
      url:'/change-product-quantity',
      data:{
         user:userId,
        cart:cartId,
        product:proId,
        count:count,
        quantity:quantity
      },
      method:"post",
      success:(response)=>{
        
        //console.log(response)
        //alert(response)
        if(response){
          
         location.reload()

        }else{
          document.getElementById(proId).value=quantity+count;
          //document.getElementById('total').innerHTML = +response.total   

         // document.getElementById('perTotal' + proId).innerHTML = price

        }
        
      }
    }) 
    //$('#refresh' + proId).load(location.href + ' #refresh' + proId);

   }


  //  block unblock

  
