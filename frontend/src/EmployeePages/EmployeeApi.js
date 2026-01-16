// frontend/src/EmployeePages/EmployeeApi.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   EMPLOYEE AUTH
===================== */

export const employeeLogin = (data) => API.post("/employee/login", data);
export const getEmployeeProfile = () => API.get("/employee/profile");
export const updateEmployeeProfile = (data) =>
  API.put("/employee/profile", data);
export const employeeLogout = () => API.post("/employee/logout");

export default API;
