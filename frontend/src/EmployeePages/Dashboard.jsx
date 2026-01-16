import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmployeeProfile,
  employeeLogout,
} from "./EmployeeApi";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getEmployeeProfile();
        setEmployee(res.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await employeeLogout();
      navigate("/login");
    } catch {
      alert("Logout failed");
    }
  };

  if (loading) {
    return <p style={styles.center}>Loading dashboard...</p>;
  }

  if (error) {
    return <p style={{ ...styles.center, color: "red" }}>{error}</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Welcome, {employee.fullName}</h2>

        <div style={styles.info}>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Designation:</strong> {employee.designation}</p>
          <p>
            <strong>Created By:</strong>{" "}
            {employee.createdByAdminEmail}
          </p>
        </div>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

/* =====================
   SIMPLE STYLES
===================== */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  info: {
    marginTop: "1rem",
    marginBottom: "2rem",
    lineHeight: "1.8",
  },
  logout: {
    width: "100%",
    padding: "10px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  center: {
    textAlign: "center",
    marginTop: "2rem",
  },
};
