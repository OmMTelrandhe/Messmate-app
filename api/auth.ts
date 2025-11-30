// // src/api/auth.ts (Create this file inside a new 'api' folder)
// import axios from "axios";
// import { UserRole } from "../types";

// // Set a base URL for all API calls.
// // In dev, it will be localhost:5000. In prod, it will be the deployed backend URL.
// const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

// // Crucial: Tell Axios to send credentials (cookies) with every request
// axios.defaults.withCredentials = true;

// export const authAPI = {
//   // --- LOCAL AUTH ENDPOINTS ---
//   login: async (email: string, password: string) => {
//     const { data } = await axios.post(`${API_URL}/api/auth/login`, {
//       email,
//       password,
//     });
//     return data; // Returns the user object
//   },

//   register: async (
//     name: string,
//     email: string,
//     password: string,
//     role: UserRole
//   ) => {
//     const { data } = await axios.post(`${API_URL}/api/auth/register`, {
//       name,
//       email,
//       password,
//       role,
//     });
//     return data; // Returns the user object
//   },

//   logout: async () => {
//     await axios.post(`${API_URL}/api/auth/logout`);
//   },

//   // --- PROFILE ENDPOINT (for initial load) ---
//   getProfile: async () => {
//     // This assumes the JWT cookie is present and valid
//     const { data } = await axios.get(`${API_URL}/api/auth/me`);
//     return data;
//   },
// };


import apiClient from './axiosClient'; // <-- NEW IMPORT

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// 1. New function to fetch the user profile using the JWT (protected route)
export const fetchUserMe = async (): Promise<User | null> => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    return null;
  }
  
  try {
    // This call will automatically include the JWT via the apiClient interceptor
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  } catch (error) {
    // If 401, the interceptor handles token removal.
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// 2. The Google Login initiation remains the same (just redirects)
export const startGoogleAuth = () => {
  // Redirect the browser to the backend's Google auth endpoint
  window.location.href = `${apiClient.defaults.baseURL.replace('/api', '')}/auth/google`;
};

// 3. The logout function is now just clearing the token
export const logoutUser = () => {
  localStorage.removeItem('jwtToken');
  // You can optionally send a POST to the backend for session cleanup, 
  // but for stateless JWT, clearing client storage is the primary action.
};

// --- REMOVED: Any functions related to password/register if not used ---
// If you have registerUser or loginUser functions, ensure they now expect a JWT
// in the response body if you are using local authentication.
