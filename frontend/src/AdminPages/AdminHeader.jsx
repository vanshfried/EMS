import { Link, useNavigate } from "react-router-dom";
import { adminLogout } from "./AdminApi";
import styles from "./AdminStyles/AdminHeader.module.css";

export default function AdminHeader({ admin }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate("/admin/login");
    } catch {
      alert("Logout failed");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/admin/dashboard" className={styles.link}>
          <strong>{admin?.email}&apos;s Dashboard</strong>
        </Link>
      </div>

      <div className={styles.right}>
        <Link to="/admin/employee-list" className={styles.link}>
          Employees
        </Link>
        <Link to="/admin/register-employee" className={styles.link}>
          Register Employee
        </Link>
         <Link to="/admin/all-attendance" className={styles.link}>
          All Attendance
        </Link>
         <Link to="/admin/attendance" className={styles.link}>
          Today's Attendance
        </Link>
        <Link to="/admin/leaves" className={styles.link}>
          Leaves
        </Link>

        <button onClick={handleLogout} className={styles.logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
