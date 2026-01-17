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
/* =====================
   EMPLOYEE ATTENDANCE
===================== */

// ✅ Employee check-in
export const employeeCheckIn = () => API.post("/attendance/check-in");

// ✅ Employee check-out
export const employeeCheckOut = () => API.post("/attendance/check-out");

// ✅ Get logged-in employee attendance history
export const getMyAttendance = () => API.get("/attendance/my");

export default API;
