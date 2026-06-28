import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile } from "./AdminApi";
import styles from "./Adminstyles/AdminDashboard.module.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getAdminProfile();
      } catch {
        setError("Unauthorized");
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p className={styles.center}>Loading dashboard…</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.adminDashboard}>
      {/* TOP BAR */}

      {/* ACTION GRID */}
      <section className={styles.tools}>
        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/register-employee")}
        >
          <h3>Register Employee</h3>
          <p>Add a new employee to the system</p>
        </div>

        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/employee-list")}
        >
          <h3>View Employees</h3>
          <p>Manage and review all employees</p>
        </div>

        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/attendance")}
        >
          <h3>Daily Attendance</h3>
          <p>Check today’s attendance records</p>
        </div>

        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/all-attendance")}
        >
          <h3>Attendance History</h3>
          <p>View attendance for all dates</p>
        </div>

        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/leaves")} 
        >
          <h3>Leave Requests</h3>
          <p>Review and manage leave requests</p>
        </div>
        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/office-location")} 
        >
          <h3>Office Location</h3>
          <p>Set and manage office location settings</p>
        </div>
        <div
          className={styles.toolCard}
          onClick={() => navigate("/admin/remote-work-requests")} 
        >
          <h3>Remote Work Requests</h3>
          <p>Review and manage remote work requests</p>
        </div>
      </section>
    </div>
  );
}
