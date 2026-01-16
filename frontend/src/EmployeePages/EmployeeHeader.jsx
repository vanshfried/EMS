import { Link, useNavigate } from "react-router-dom";
import { employeeLogout } from "./EmployeeApi";
import styles from "./EmployeeStyles/EmployeeHeader.module.css";

export default function EmployeeHeader({ employee }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await employeeLogout();
      navigate("/login");
    } catch {
      alert("Logout failed");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/"><strong className={styles.link}>{employee?.fullName}&apos;s Dashboard</strong></Link>
        
      </div>

      <div className={styles.right}>
        <Link to="/profile" className={styles.link}>
          Profile
        </Link>
        
        <button onClick={handleLogout} className={styles.logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
