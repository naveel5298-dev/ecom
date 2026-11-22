import { API_BASE_URL, ROUTES } from "../utility/url";


export async function getProductsApi() {
    const res = await fetch(API_BASE_URL+ROUTES.getallproducts,{
      method:"GET",
      headers:{
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    })
    return await res.json();
}

//add product
// export async function addProductApi(productData: any) {
//     const res = await fetch(API_BASE_URL+ROUTES.addproduct,{  
//       method:"POST",
//       headers:{
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${localStorage.getItem("token")}`
//       },
//       body: JSON.stringify(productData)
//     })
//     return await res.json();
// }


export async function addProductApi(formData: FormData) {
    const response = await fetch(
        `${API_BASE_URL}${ROUTES.addproduct}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to add product");
    }

    return result;
}



// Modify product 

export async function updateProductApi (){

}


// remove product

export async function removeProductApi(productId:string) {
  const Res = await fetch(`${API_BASE_URL}${ROUTES.removeProduct}/${productId}`,{
  method:"DELETE",
  headers:{
   "content-type":"application/json",
   "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  })
  return Res.json();
}