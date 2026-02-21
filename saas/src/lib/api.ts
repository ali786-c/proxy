import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: false, // Using Bearer tokens exclusively to avoid CSRF/Session conflicts on XAMPP
});

// Request interceptor for token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for unauthorized handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("auth_token");
            // Optional: redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
