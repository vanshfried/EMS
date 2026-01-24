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
export const employeeCheckIn = (data) => API.post("/attendance/check-in", data);

// ✅ Employee check-out
export const employeeCheckOut = () => API.post("/attendance/check-out");

// ✅ Get logged-in employee attendance history
export const getMyAttendance = () => API.get("/attendance/my");

// ✅ Get attendance summary for dashboard
export const getMyAttendanceSummary = () => API.get("/attendance/my/summary");

/* =====================
   EMPLOYEE LEAVES
===================== */

// ✅ Apply for leave
export const applyLeave = (data) => API.post("/leaves/apply", data);
/*
  data = {
    leaveType,
    startDate,
    endDate,
    reason
  }
*/

// ✅ Get logged-in employee leaves
export const getMyLeaves = () => API.get("/leaves/my");

// ✅ Cancel leave (only Pending)
export const cancelLeave = (leaveId) => API.delete(`/leaves/${leaveId}`);

export default API;
