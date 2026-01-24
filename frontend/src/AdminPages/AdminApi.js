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
   LEAVE MANAGEMENT (ADMIN)
===================== */

// ✅ Get all leave requests
export const getAllLeaves = () => API.get("/admin/leaves");

// ✅ Get single leave request
export const getSingleLeave = (leaveId) => API.get(`/admin/leaves/${leaveId}`);

// ✅ Approve / Reject leave
export const reviewLeave = (leaveId, data) =>
  API.patch(`/admin/leaves/${leaveId}`, data);
/*
  data = {
    status: "Approved" | "Rejected",
    adminRemarks?: string
  }
*/

// ✅ Get leaves by status (Pending / Approved / Rejected)
export const getLeavesByStatus = (status) =>
  API.get(`/admin/leaves/status/${status}`);

/* =====================
   OFFICE LOCATION (ADMIN)
===================== */

// ✅ Set / Update office location
export const setOfficeLocation = (data) =>
  API.post("/admin/office-location", data);
/*
  data = {
    name: string,
    latitude: number,
    longitude: number,
    allowedRadiusMeters?: number // optional (defaults to 100)
  }
*/

// ✅ Get current office location
export const getOfficeLocation = () => API.get("/admin/office-location");

/* =====================
   EMPLOYEE REGISTRATION
===================== */
export const registerEmployee = (data) => API.post("/employee/register", data);

export default API;
