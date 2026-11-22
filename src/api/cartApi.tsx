// import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL, ROUTES } from "../utility/url";

/// Add to Cart API
export async function addtoCartApi(AddData:any) {
  const Res = await fetch(`${API_BASE_URL}${ROUTES.addtocart}`,{
  method:"POST",
  headers:{
   "content-type":"application/json",
   "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  body:JSON.stringify(AddData)
  })
  return Res.json();
}

// show cart items API
export async function getCartItemsApi() {
  const Res = await fetch(`${API_BASE_URL}${ROUTES.getcartitems}`,{
  method:"GET",
  headers:{
   "content-type":"application/json",
   "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  })
  return Res.json();
}

// update cart quantity API
export async function updateCartQuantityApi(cartItemId:string, action:string) {
 // console.log("Updating cart item:", cartItemId, "with action:", action);
  const Res = await fetch(`${API_BASE_URL}${ROUTES.updatecartquantity}/${cartItemId}`,{
  method:"PUT",
  headers:{
   "content-type":"application/json",
   "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  body:JSON.stringify({ action})
  })
  return Res.json();
}

// remove from cart API
export async function removeFromCartApi(cartItemId:string) {
  const Res = await fetch(`${API_BASE_URL}${ROUTES.removefromcart}/${cartItemId}`,{
  method:"DELETE",
  headers:{
   "content-type":"application/json",
   "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  })
  return Res.json();
}


// const addtoCartApi = createAsyncThunk(
//   "cart/addToCart",

//   async()=>{
//     const res =  await fetch(`${API_BASE_URL}${ROUTES.addtocart}`,{ 
//       method:"POST",
//       headers:{
//        "content-type":"application/json",
//         "Authorization": `Bearer ${localStorage.getItem("token")}`
//       },
     
//     })
//     return res.json();
//   }
// )
