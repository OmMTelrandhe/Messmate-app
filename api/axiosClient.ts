import axios from 'axios';

// IMPORTANT: Ensure this VITE environment variable points to your Railway backend URL
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: SERVER_BASE_URL,
  timeout: 10000,
  // 🚫 CRITICAL: We remove 'withCredentials: true' as we are no longer using cookies.
});

// Request Interceptor: Automatically attach the JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from Local Storage
    const token = localStorage.getItem('jwtToken');

    if (token) {
      // Attach the token as a Bearer token in the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor for global 401 handling (e.g., auto-logout)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("401 Unauthorized: JWT expired or invalid. Clearing token.");
            // Force logout by removing the invalid token
            localStorage.removeItem('jwtToken');
            // A professional app would redirect to login here, but we'll leave that to the AuthContext.
        }
        return Promise.reject(error);
    }
);

export default apiClient;
