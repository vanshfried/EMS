import { useEffect, useState } from "react";
import { getAllAttendance } from "../AdminPages/AdminApi";
import styles from "./AdminStyles/AdminAllAttendance.module.css";

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
  if (!date) return "—";
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

const AdminAllAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getAllAttendance({
        page: pageNumber,
        limit: 20,
      });

      setAttendance(res.data.data || []);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(page);
  }, [page]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All-Time Attendance</h2>

      {loading ? (
        <p className={styles.center}>Loading attendance...</p>
      ) : (
        <>
          <div className={styles.card}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Working Time</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>

              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.center}>
                      No attendance records
                    </td>
                  </tr>
                ) : (
                  attendance.map((item) => (
                    <tr key={item._id}>
                      <td>{item.employee?.fullName || "—"}</td>
                      <td>{item.employee?.email || "—"}</td>
                      <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>
                      <td
                        className={`${styles.status} ${
                          item.status === "Present"
                            ? styles.present
                            : item.status === "Half Day"
                              ? styles.halfDay
                              : item.status === "Leave"
                                ? styles.leave
                                : styles.absent
                        }`}
                      >
                        {item.status}
                      </td>
                      <td>{formatWorkingTime(item.workingMinutes)}</td>
                      <td>{formatTime(item.checkInTime)}</td>
                      <td>{formatTime(item.checkOutTime)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={styles.pageButton}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={styles.pageButton}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAllAttendance;
