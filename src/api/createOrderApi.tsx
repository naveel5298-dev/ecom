// import { API_BASE_URL, ROUTES } from "../utility/url";

// const PlaceOrderApi = async (orderData: any) => {
//     const res = await fetch(`${API_BASE_URL}${ROUTES.placeorder}`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${localStorage.getItem("token")}`
//         },np
//         body: JSON.stringify(orderData)
//     });
//     console.log("PlaceOrderApi response:", res);
//     return res.json();
// }
// export default PlaceOrderApi;


// import axios, {AxiosResponse } from "axios";

// const PlaceOrderApi = async (orderData: any) => {
//     const res: AxiosResponse = await axios.post(`${API_BASE_URL}${ROUTES.placeorder}`, orderData, {
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${localStorage.getItem("token")}`
//         }
//     });
//     return res.data;
// }