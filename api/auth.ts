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


import apiClient from './axiosClient';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const authAPI = {
  async login(email: string, password: string): Promise<User> {
    const res = await apiClient.post<{ token: string } & User>('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('jwtToken', res.data.token);
    }
    return {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
    };
  },
  async register(name: string, email: string, password: string, role: string): Promise<User> {
    const res = await apiClient.post<{ token: string } & User>('/auth/register', { name, email, password, role });
    if (res.data.token) {
      localStorage.setItem('jwtToken', res.data.token);
    }
    return {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
    };
  },
  async logout(): Promise<void> {
    localStorage.removeItem('jwtToken');
    try {
      await apiClient.post('/auth/logout');
    } catch {}
  },
  async getProfile(): Promise<User | null> {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    try {
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    } catch {
      return null;
    }
  },
};

export { authAPI };
