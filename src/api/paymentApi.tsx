import { API_BASE_URL, ROUTES } from "../utility/url";

export async function makePaymentApi(paymentData: any) {
    const res = await fetch(API_BASE_URL+ROUTES.makepayment,{  
      method:"POST",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(paymentData)
    })
    return await res.json();
}

// VERIFY RESPONSE
export async function verifyPaymentApi(verifyData: any) {
    const res = await fetch(API_BASE_URL+ROUTES.verifyPayment,{  
      method:"POST",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(verifyData)
    })
    return await res.json();
}