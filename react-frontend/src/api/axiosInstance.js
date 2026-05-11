import axios from "axios";
import { getToken } from "../utils/auth";
import { toast } from "react-toastify";

const api = axios.create({
//    baseURL: "http://127.0.0.1:8000/api"
      baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(
            error.response && 
            error.response.status === 401 &&
            !error.config.url.includes("/login")
        ) {

            localStorage.removeItem("token");

            toast.error("Session expired. Please try again.");

            setTimeout(() => {
                window.location.href = '/';
            }, 1500)
        }

        return Promise.reject(error);
    }
);

export default api;

