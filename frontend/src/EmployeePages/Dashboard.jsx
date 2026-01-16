import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployeeProfile, employeeLogout } from "./EmployeeApi";
import styles from "./EmployeeStyles/EmployeeDashboard.module.css";

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
    return <p className={styles.center}>Loading dashboard...</p>;
  }

  if (error) {
    return <p className={`${styles.center} ${styles.error}`}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Welcome, {employee.fullName}</h2>

        <div className={styles.info}>
          <p>
            <strong>Email:</strong> {employee.email}
          </p>
          <p>
            <strong>Department:</strong> {employee.department}
          </p>
          <p>
            <strong>Designation:</strong> {employee.designation}
          </p>
        </div>

      </div>
    </div>
  );
}
