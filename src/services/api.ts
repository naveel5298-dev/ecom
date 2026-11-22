import axios from "axios";

// This is a basic setup for an API client using axios.
// You can replace the baseURL with your actual backend or use environment variables.
const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Example request interceptor
api.interceptors.request.use(
  (config) => {
    // Inject auth token here if needed
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = \`Bearer \${token}\`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Example response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  },
);
