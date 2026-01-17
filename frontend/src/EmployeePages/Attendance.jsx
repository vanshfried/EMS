import { useEffect, useState } from "react";
import {
  employeeCheckIn,
  employeeCheckOut,
  getMyAttendance,
} from "./EmployeeApi";

/* =====================
   IST HELPERS (Frontend-only)
===================== */

const IST_TIMEZONE = "Asia/Kolkata";

const getISTDateString = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

const getISTDayName = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    weekday: "long",
  }).format(new Date(date));

const getISTTimeString = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(date));

/* =====================
   COMPONENT
===================== */

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await getMyAttendance();
      const records = res.data.attendance || [];

      setAttendance(records);

      // IST-based "today" detection
      const todayIST = getISTDateString(new Date());

      const todayRecord = records.find(
        (a) => getISTDateString(a.date) === todayIST,
      );

      setTodayAttendance(todayRecord || null);
    } catch (error) {
      console.error("Fetch attendance error:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await employeeCheckIn();
      await fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await employeeCheckOut();
      await fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🕘 Employee Attendance</h2>

      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleCheckIn} disabled={loading || !!todayAttendance}>
          Check In
        </button>

        <button
          onClick={handleCheckOut}
          disabled={
            loading || !todayAttendance || todayAttendance?.checkOutTime
          }
          style={{ marginLeft: "10px" }}
        >
          Check Out
        </button>
      </div>

      {/* TODAY STATUS */}
      {todayAttendance && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Today ({getISTDayName(todayAttendance.date)}):</strong>{" "}
          Checked in at {getISTTimeString(todayAttendance.checkInTime)}
          {todayAttendance.checkOutTime && (
            <>
              {" | Checked out at "}
              {getISTTimeString(todayAttendance.checkOutTime)}
            </>
          )}
        </div>
      )}

      {/* ATTENDANCE TABLE */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In (IST)</th>
            <th>Check Out (IST)</th>
            <th>Working Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length === 0 ? (
            <tr>
              <td colSpan="5" align="center">
                No attendance records
              </td>
            </tr>
          ) : (
            attendance.map((a) => (
              <tr key={a._id}>
                <td>
                  {getISTDateString(a.date)}
                  <br />
                  <small style={{ color: "#666" }}>
                    {getISTDayName(a.date)}
                  </small>
                </td>
                <td>{a.checkInTime ? getISTTimeString(a.checkInTime) : "-"}</td>
                <td>
                  {a.checkOutTime ? getISTTimeString(a.checkOutTime) : "-"}
                </td>
                <td>{a.workingHours || 0}</td>
                <td>{a.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
