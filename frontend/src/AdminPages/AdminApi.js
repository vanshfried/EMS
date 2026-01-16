// frontend/src/AdminPages/AdminApi.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});


export const adminLogin = (data) => API.post("/admin/login", data);
export const getAdminProfile = () => API.get("/admin/profile");
export const registerEmployee = (data) => API.post("/employee/register", data);
export const getAllEmployees = () => API.get("/admin/employees");
export const adminLogout = () => API.post("/admin/logout");

export default API;
