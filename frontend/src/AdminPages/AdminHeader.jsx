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
        <Link to="/admin/employees" className={styles.link}>
          Employees
        </Link>

        <button onClick={handleLogout} className={styles.logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
