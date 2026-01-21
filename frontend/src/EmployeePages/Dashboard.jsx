import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEmployeeProfile,
  getMyAttendance,
  getMyLeaves,
  employeeCheckIn,
  employeeCheckOut,
} from "./EmployeeApi";

import styles from "./EmployeeStyles/EmployeeDashboard.module.css";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================
     FETCH DASHBOARD DATA
  ===================== */
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [profileRes, attendanceRes, leavesRes] = await Promise.all([
        getEmployeeProfile(),
        getMyAttendance(),
        getMyLeaves(),
      ]);

      // ✅ FIXED RESPONSE HANDLING
      setEmployee(profileRes.data.employee);
      setAttendance(attendanceRes.data.attendance || []);
      setLeaves(leavesRes.data.leaves || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =====================
     DERIVED DATA
  ===================== */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ DATE-SAFE COMPARISON
  const todayAttendance = attendance.find((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const presentDays = attendance.filter((a) => a.status === "Present").length;
  const absentDays = attendance.filter((a) => a.status === "Absent").length;

  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "Approved").length;

  /* =====================
     ACTIONS
  ===================== */
  const handleCheckIn = async () => {
    try {
      await employeeCheckIn();
      await loadDashboard(); // ✅ refresh data without reload
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await employeeCheckOut();
      await loadDashboard(); // ✅ refresh data without reload
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  /* =====================
     STATES
  ===================== */
  if (loading) {
    return <p className={styles.center}>Loading dashboard...</p>;
  }

  if (error) {
    return <p className={`${styles.center} ${styles.error}`}>{error}</p>;
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className={styles.dashboard}>
      {/* ===== WELCOME SECTION ===== */}
      <section className={styles.welcome}>
        <h2>Welcome back, {employee?.fullName}</h2>
        <p>
          {employee?.designation} · {employee?.department}
        </p>
      </section>

      {/* ===== OVERVIEW STATS ===== */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Attendance</h4>
          <p>{presentDays} Present</p>
          <span>{absentDays} Absent</span>
        </div>

        <div className={styles.statCard}>
          <h4>Leaves</h4>
          <p>{approvedLeaves} Approved</p>
          <span>{pendingLeaves} Pending</span>
        </div>

        <div className={styles.statCard}>
          <h4>Today</h4>
          <p>{todayAttendance ? todayAttendance.status : "Not Checked In"}</p>
        </div>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className={styles.actions}>
        <button onClick={handleCheckIn}>Check In</button>
        <button onClick={handleCheckOut}>Check Out</button>
        <button onClick={() => navigate("/attendance")}>View Attendance</button>
        <button onClick={() => navigate("/leaves")}>Apply Leave</button>
      </section>

      {/* ===== ATTENDANCE SNAPSHOT ===== */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>Recent Attendance</h3>
          <button onClick={() => navigate("/attendance")}>View All</button>
        </div>

        {attendance.length === 0 && <p>No attendance records</p>}

        {attendance.slice(0, 5).map((a) => (
          <div key={a._id} className={styles.row}>
            <span>{new Date(a.date).toDateString()}</span>
            <span className={styles.status}>{a.status}</span>
          </div>
        ))}
      </section>

      {/* ===== LEAVE SNAPSHOT ===== */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>Leave Requests</h3>
          <button onClick={() => navigate("/leaves")}>View All</button>
        </div>

        {leaves.length === 0 && <p>No leave requests</p>}

        {leaves.slice(0, 5).map((l) => (
          <div key={l._id} className={styles.row}>
            <span>
              {l.leaveType} ({l.startDate} → {l.endDate})
            </span>
            <span className={styles.status}>{l.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
