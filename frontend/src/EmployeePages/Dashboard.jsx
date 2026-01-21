import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getEmployeeProfile,
  getMyAttendance,
  getMyAttendanceSummary,
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
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================
     FETCH DASHBOARD DATA
  ===================== */
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [profileRes, attendanceRes, leavesRes, summaryRes] =
        await Promise.all([
          getEmployeeProfile(),
          getMyAttendance(),
          getMyLeaves(),
          getMyAttendanceSummary(),
        ]);

      // ✅ FIXED: matches backend response
      setEmployee(profileRes.data.data);

      setAttendance(attendanceRes.data.attendance || []);
      setLeaves(leavesRes.data.leaves || []);
      setSummary(summaryRes.data);
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

  const todayAttendance = attendance.find((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "Approved").length;

  /* =====================
     ATTENDANCE CIRCLE
  ===================== */
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const progress =
    summary && summary.presentRatio
      ? (summary.presentRatio / 100) * circumference
      : 0;

  /* =====================
     ACTIONS
  ===================== */
  const handleCheckIn = async () => {
    try {
      await employeeCheckIn();
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await employeeCheckOut();
      await loadDashboard();
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
      {/* ===== WELCOME ===== */}
      <section className={styles.welcome}>
        <h2>
          Welcome back{employee?.fullName ? `, ${employee.fullName}` : ""}
        </h2>
        <p>
          {employee?.designation} · {employee?.department}
        </p>
      </section>

      {/* ===== OVERVIEW STATS ===== */}
      <section className={styles.statsGrid}>
        {/* ATTENDANCE */}
        <div className={styles.statCard}>
          <h4>Attendance</h4>

          {summary && (
            <div className={styles.attendanceCircle}>
              <svg width="120" height="120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#22c55e"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  transform="rotate(-90 60 60)"
                  strokeLinecap="round"
                />
              </svg>

              <div className={styles.circleText}>
                <strong>
                  {summary.presentDays} / {summary.totalDays}
                </strong>
                <span>Days Present</span>
              </div>
            </div>
          )}
        </div>

        {/* LEAVES */}
        <div className={styles.statCard}>
          <h4>Leaves</h4>
          <p>{approvedLeaves} Approved</p>
          <span>{pendingLeaves} Pending</span>
        </div>

        {/* TODAY */}
        <div className={styles.statCard}>
          <h4>Today</h4>
          <p>
            {todayAttendance?.status ||
              (todayAttendance ? "Checked In" : "Not Checked In")}
          </p>
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
