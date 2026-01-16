import { useEffect, useState } from "react";
import { getAllEmployees } from "./AdminApi";
import styles from "./AdminStyles/EmployeeList.module.css";
import { Link } from "react-router-dom";
export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getAllEmployees();
        setEmployees(res.data.data); // because backend returns { data: employees }
      } catch (err) {
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return <p className={styles.center}>Loading employees...</p>;
  }

  if (error) {
    return <p className={`${styles.center} ${styles.error}`}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h2>All Employees</h2>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <Link to={`/admin/employees/${emp._id}`}>
                      {emp.fullName}
                    </Link>
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>
                    <span
                      className={emp.isActive ? styles.active : styles.inactive}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
