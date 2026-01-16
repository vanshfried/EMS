import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, adminLogout, getAllEmployees } from "./AdminApi";
import styles from "./AdminStyles/AdminDashboard.module.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await getAdminProfile();
        setEmail(profileRes.data.data.email);

        const empRes = await getAllEmployees();
        setTotalEmployees(empRes.data.data.length);
      } catch {
        setError("Unauthorized");
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } finally {
      navigate("/admin/login");
    }
  };

  if (loading) return <p className={styles.center}>Loading dashboard...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.header}>
        <h2>{email}&apos;s Dashboard</h2>
        <p>Administrator access</p>
      </header>

      {/* SMALL STAT ON TOP */}
      <div className={styles.topStat}>
        <span>Total Employees</span>
        <strong>{totalEmployees}</strong>
      </div>

      {/* MAIN ACTION CARDS */}
      <div className={styles.tools}>
        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/register-employee")}
        >
          ➕ Register Employee
        </div>

        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/employee-list")}
        >
          👥 View Employees
        </div>
      </div>
    </div>
  );
}
