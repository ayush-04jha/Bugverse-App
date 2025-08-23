import axios from "axios";

  


const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem("token");
        if(token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    }
)
instance.interceptors.response.use(
  response => response, // normal response pass through
  error => {
    if (error.response && error.response.status === 401) {
      // Token invalid/expired
      localStorage.removeItem("token"); // clear token
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"; // fallback SPA redirect
      }
    }
    return Promise.reject(error);
  }
);


export default instance;