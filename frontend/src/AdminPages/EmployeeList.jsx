import { useEffect, useState } from "react";
import { getAllEmployees, getTodayAttendance } from "./AdminApi";
import styles from "./AdminStyles/EmployeeList.module.css";
import { Link } from "react-router-dom";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attendanceRes] = await Promise.all([
          getAllEmployees(),
          getTodayAttendance(),
        ]);

        // Map attendance by employeeId
        const map = {};
        attendanceRes.data.data.forEach((item) => {
          map[item.employee._id] = item.attendance;
        });

        setEmployees(empRes.data.data);
        setAttendanceMap(map);
      } catch (err) {
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
                <th>Account Status</th>
                <th>Worked Today</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => {
                const today = attendanceMap[emp._id];
                const isPresent = today?.status === "Present";

                return (
                  <tr key={emp._id}>
                    <td>
                      <Link to={`/admin/employees/${emp._id}`}>
                        {emp.fullName}
                      </Link>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>

                    {/* Account Active / Inactive */}
                    <td>
                      <span
                        className={
                          emp.isActive ? styles.active : styles.inactive
                        }
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Attendance Today */}
                    <td>
                      <span
                        className={isPresent ? styles.active : styles.inactive}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
