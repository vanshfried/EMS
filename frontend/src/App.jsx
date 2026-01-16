import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin Pages
import AdminLogin from "./AdminPages/Login";
import AdminDashboard from "./AdminPages/DashBoard";
import SecretRoute from "./AdminPages/SecretRoutes";
import RegisterEmployee from "./AdminPages/RegisterEmployee";
import EmployeeList from "./AdminPages/EmployeeList";
import EmployeeDetails from "./AdminPages/EmployeeDetails";

// Employee Pages
import EmployeeProtectedRoute from "./EmployeePages/EmployeeProtectedRoute";
import EmployeeLayout from "./EmployeePages/EmployeeLayout";
import EmployeeLogin from "./EmployeePages/Login";
import EmployeeDashboard from "./EmployeePages/Dashboard";
import Profile from "./EmployeePages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<SecretRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/register-employee"
            element={<RegisterEmployee />}
          />
          <Route path="/admin/employee-list" element={<EmployeeList />} />
          <Route path="/admin/employees/:id" element={<EmployeeDetails />} />
        </Route>

        {/* Employee */}
        <Route element={<EmployeeProtectedRoute />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/" element={<EmployeeDashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* future employee routes go here */}
          </Route>
        </Route>

        <Route path="/login" element={<EmployeeLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
