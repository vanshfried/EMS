import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin Pages
import AdminLogin from "./AdminPages/Login";
import AdminDashboard from "./AdminPages/DashBoard";
import SecretRoute from "./AdminPages/SecretRoutes";
import RegisterEmployee from "./AdminPages/RegisterEmployee";

// Employee Pages 
import EmployeeProtectedRoute from "./EmployeePages/EmployeeProtectedRoute";
import EmployeeLogin from "./EmployeePages/Login";
import EmployeeDashboard from "./EmployeePages/Dashboard";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<SecretRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/register-employee" element={<RegisterEmployee />} />
        </Route>
        <Route element={<EmployeeProtectedRoute />}>
          <Route path="/" element={<EmployeeDashboard />} />
        </Route>
        <Route path="/login" element={<EmployeeLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
