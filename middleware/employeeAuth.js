// backend/middleware/employeeAuth.js
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

const employeeAuth = async (req, res, next) => {
  try {
    const token = req.cookies.employeeToken;

    if (!token) {
      return res.status(401).json({ message: "Employee not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const employee = await Employee.findById(decoded.employeeId)
      .select("-password");

    if (!employee) {
      return res.status(401).json({ message: "Invalid employee session" });
    }

    req.employee = employee;
    next();
  } catch {
    return res.status(401).json({ message: "Employee authentication failed" });
  }
};

export default employeeAuth;
