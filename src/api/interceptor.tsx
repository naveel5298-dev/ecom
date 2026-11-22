import { API_URL } from "@/lib/settings";
import axios from "axios";
console.log("API URL:", API_URL); // Debugging line to check the API URL being used
const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;