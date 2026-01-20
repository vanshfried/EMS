import { useEffect, useState } from "react";
import { getTodayAttendance } from "./AdminApi";
import styles from "./Adminstyles/DailyAttendance.module.css";

/* =====================
   HELPERS
===================== */

const formatWorkingTime = (minutes) => {
  if (!minutes || minutes <= 0) return "0h 0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const formatTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

/* =====================
   COMPONENT
===================== */

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const res = await getTodayAttendance();
      setAttendance(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  if (loading) {
    return <p className={`${styles.centerText}`}>Loading attendance...</p>;
  }

  if (error) {
    return (
      <p className={`${styles.centerText} ${styles.errorText}`}>{error}</p>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Today’s Attendance</h1>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.centerText}>
                  No attendance records
                </td>
              </tr>
            ) : (
              attendance.map((row) => {
                const { employee, attendance: record } = row;

                return (
                  <tr key={employee._id}>
                    <td>{employee.fullName}</td>
                    <td>{employee.email}</td>
                    <td>{formatTime(record.checkInTime)}</td>
                    <td>{formatTime(record.checkOutTime)}</td>
                    <td>{formatWorkingTime(record.workingMinutes)}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          record.status === "Absent"
                            ? styles.absent
                            : record.status === "Half Day"
                              ? styles.halfDay
                              : record.status === "Leave"
                                ? styles.leave
                                : styles.present
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
