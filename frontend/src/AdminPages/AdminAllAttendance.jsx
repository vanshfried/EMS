import { useEffect, useState, useCallback, useMemo } from "react";
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

  /* -------- API CALL (memoized) -------- */
  const fetchAttendance = useCallback(async (pageNumber) => {
    try {
      setLoading(true);
      const res = await getAllAttendance({
        page: pageNumber,
        limit: 20,
      });

      setAttendance(res?.data?.data || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------- Fetch on page change -------- */
  useEffect(() => {
    fetchAttendance(page);
  }, [page, fetchAttendance]);

  /* -------- Memoized formatted data -------- */
  const formattedAttendance = useMemo(() => {
    return attendance.map((item) => ({
      id: item._id,
      name: item.employee?.fullName || "—",
      email: item.employee?.email || "—",
      date: item.date ? new Date(item.date).toLocaleDateString("en-IN") : "—",
      status: item.status,
      workingTime: formatWorkingTime(item.workingMinutes),
      checkIn: formatTime(item.checkInTime),
      checkOut: formatTime(item.checkOutTime),
    }));
  }, [attendance]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All-Time Attendance</h2>

      {/* Loading Indicator (non-blocking) */}
      {loading && <p className={styles.center}>Loading...</p>}

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
            {formattedAttendance.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className={styles.center}>
                  No attendance records
                </td>
              </tr>
            ) : (
              formattedAttendance.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.date}</td>
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
                  <td>{item.workingTime}</td>
                  <td>{item.checkIn}</td>
                  <td>{item.checkOut}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
          className={styles.pageButton}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
          className={styles.pageButton}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminAllAttendance;
