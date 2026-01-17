// frontend/src/AdminPages/AdminApi.js
import axios from "axios";

/* =====================
   AXIOS INSTANCE
===================== */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ REQUIRED for cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   AUTH
===================== */
export const adminLogin = (data) => API.post("/admin/login", data);
export const getAdminProfile = () => API.get("/admin/profile");
export const adminLogout = () => API.post("/admin/logout");

/* =====================
   EMPLOYEES
===================== */
export const getAllEmployees = () => API.get("/admin/employees");

export const getSingleEmployee = (employeeId) =>
  API.get(`/admin/employees/${employeeId}`);

/* =====================
   ATTENDANCE
===================== */

// Attendance of ONE employee
export const getEmployeeAttendance = (employeeId) =>
  API.get(`/admin/employees/${employeeId}/attendance`);

// Today's attendance (Present + Absent)
export const getTodayAttendance = () => API.get("/admin/attendance/today");

// All attendance (paginated)
export const getAllAttendance = ({ page = 1, limit = 20 } = {}) =>
  API.get(`/admin/attendance?page=${page}&limit=${limit}`);

/* =====================
   EMPLOYEE REGISTRATION
===================== */
export const registerEmployee = (data) => API.post("/employee/register", data);

export default API;
