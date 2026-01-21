import { useEffect, useState, useMemo } from "react";
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
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================
     LOAD DASHBOARD
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

      setEmployee(profileRes.data.data);
      setAttendance(attendanceRes.data.attendance || []);
      setLeaves(leavesRes.data.leaves || []);
      setSummary(summaryRes.data);
    } catch (err) {
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
  const todayAttendance = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return attendance.find((a) => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  }, [attendance]);

  const isCheckedInToday = Boolean(todayAttendance?.checkIn);
  const isCheckedOutToday = Boolean(todayAttendance?.checkOut);

  const todayStatus = todayAttendance?.status || "Not Checked In";

  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "Approved").length;

  /* =====================
     ATTENDANCE CIRCLE
  ===================== */
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const progress = summary?.presentRatio
    ? (summary.presentRatio / 100) * circumference
    : 0;

  /* =====================
     ACTIONS
  ===================== */
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await employeeCheckIn();
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await employeeCheckOut();
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================
     STATES
  ===================== */
  if (loading) {
    return <p className={styles.center}>Loading dashboard…</p>;
  }

  if (error) {
    return <p className={`${styles.center} ${styles.error}`}>{error}</p>;
  }

  /* =====================
     UI
  ===================== */
  return (
    <div className={styles.dashboard}>
      {/* WELCOME */}
      <section className={styles.welcome}>
        <h2>Welcome back{employee?.fullName && `, ${employee.fullName}`}</h2>
        <p>
          {employee?.designation} · {employee?.department}
        </p>
      </section>

      {/* STATS */}
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
          <p>{approvedLeaves}</p>
          <span>{pendingLeaves} Pending</span>
        </div>

        {/* TODAY */}
        <div className={styles.statCard}>
          <h4>Today</h4>
          <span className={`${styles.status} ${styles[todayStatus]}`}>
            {todayStatus}
          </span>
          {todayAttendance?.checkIn && (
            <p className={styles.time}>
              In: {new Date(todayAttendance.checkIn).toLocaleTimeString()}
            </p>
          )}
          {todayAttendance?.checkOut && (
            <p className={styles.time}>
              Out: {new Date(todayAttendance.checkOut).toLocaleTimeString()}
            </p>
          )}
        </div>
      </section>

      {/* ACTIONS */}
      <section className={styles.actions}>
        <button
          onClick={handleCheckIn}
          disabled={isCheckedInToday || actionLoading}
        >
          Check In
        </button>
        <button
          onClick={handleCheckOut}
          disabled={!isCheckedInToday || isCheckedOutToday || actionLoading}
        >
          Check Out
        </button>
        <button onClick={() => navigate("/attendance")}>View Attendance</button>
        <button onClick={() => navigate("/leaves")}>Apply Leave</button>
      </section>

      {/* RECENT ATTENDANCE */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>Recent Attendance</h3>
          <button onClick={() => navigate("/attendance")}>View All</button>
        </div>

        {attendance.length === 0 && <p>No attendance records</p>}

        {attendance.slice(0, 5).map((a) => (
          <div key={a._id} className={styles.row}>
            <span>{new Date(a.date).toDateString()}</span>
            <span className={`${styles.status} ${styles[a.status]}`}>
              {a.status}
            </span>
          </div>
        ))}
      </section>

      {/* LEAVES */}
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
            <span className={`${styles.status} ${styles[l.status]}`}>
              {l.status}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
