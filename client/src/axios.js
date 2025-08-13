import axios from "axios";
const API_BASE_URL =
  
  import.meta.env.MODE === "production"
    ?"https://your-render-api.onrender.com/api"  // local backend
    : "http://localhost:5000/api" ; // render production backend


const instance = axios.create(
  {baseURL: API_BASE_URL,
    withCredentials: true,
  }

);

instance.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem("token");
        if(token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    }
)

export default instance;