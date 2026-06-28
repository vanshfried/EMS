import { useEffect, useState } from "react";
import {
  employeeCheckIn,
  employeeCheckOut,
  getMyAttendance,
  requestRemoteWork,
  getMyRemoteRequests,
} from "./EmployeeApi";

/* =====================
   IST HELPERS
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
   WORKING TIME FORMATTER
===================== */

const formatWorkingTime = (minutes) => {
  if (!minutes || minutes <= 0) return "0h 0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

/* =====================
   COMPONENT
===================== */

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [remoteRequests, setRemoteRequests] = useState([]);

  /* =====================
     FETCH ATTENDANCE
  ===================== */
  const fetchAttendance = async () => {
    try {
      const res = await getMyAttendance();
      const records = res.data.attendance || [];

      setAttendance(records);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRecord = records.find((a) => {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      setTodayAttendance(todayRecord || null);
    } catch (error) {
      console.error("Fetch attendance error:", error);
    }
  };
  const fetchRemoteRequests = async () => {
    try {
      const res = await getMyRemoteRequests();
      setRemoteRequests(res.data.requests || []);
    } catch (error) {
      console.error("Fetch remote requests error:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchRemoteRequests();
  }, []);

  /* =====================
     CHECK-IN (LIVE GPS)
  ===================== */
  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await employeeCheckIn({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          await fetchAttendance();
        } catch (error) {
          alert(error.response?.data?.message || "Check-in failed");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert(
          "Location access is required to check in. Please allow location access.",
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // 🔥 FORCE LIVE LOCATION (NO CACHED GPS)
      },
    );
  };

  /* =====================
     CHECK-OUT
  ===================== */
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
  const handleRemoteRequest = async () => {
    if (!requestDate || !requestReason.trim()) {
      return alert("Please select a date and enter a reason.");
    }

    try {
      setLoading(true);

      await requestRemoteWork({
        date: requestDate,
        reason: requestReason,
      });

      alert("Remote work request submitted.");

      setRequestDate("");
      setRequestReason("");

      await fetchRemoteRequests();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to submit remote work request",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🕘 Employee Attendance</h2>

      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleCheckIn}
          disabled={loading || todayAttendance?.checkInTime}
        >
          {loading ? "Checking location..." : "Check In"}
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
      {/* =====================
   REMOTE WORK REQUEST
===================== */}
      <div
        style={{
          marginBottom: "20px",
          border: "1px solid #ccc",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h3>🏠 Request Remote Work</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Date:</label>
          <br />
          <input
            type="date"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Reason:</label>
          <br />
          <textarea
            rows="3"
            style={{ width: "100%" }}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            placeholder="Why do you need to work remotely?"
          />
        </div>

        <button onClick={handleRemoteRequest} disabled={loading}>
          Submit Request
        </button>
      </div>
      {/* =====================
   MY REMOTE WORK REQUESTS
===================== */}
      <div style={{ marginBottom: "20px" }}>
        <h3>📋 My Remote Work Requests</h3>

        <table border="1" cellPadding="10" width="100%">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {remoteRequests.length === 0 ? (
              <tr>
                <td colSpan="3" align="center">
                  No remote work requests
                </td>
              </tr>
            ) : (
              remoteRequests.map((request) => (
                <tr key={request._id}>
                  <td>{getISTDateString(request.date)}</td>
                  <td>{request.reason}</td>
                  <td>{request.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TODAY STATUS */}
      {todayAttendance ? (
        <div style={{ marginBottom: "20px" }}>
          <strong>Today ({getISTDayName(todayAttendance.date)}):</strong>{" "}
          {todayAttendance.checkInTime
            ? `Checked in at ${getISTTimeString(todayAttendance.checkInTime)}`
            : "Not checked in yet"}
          {todayAttendance.checkOutTime && (
            <>
              {" | Checked out at "}
              {getISTTimeString(todayAttendance.checkOutTime)}
              {" | Worked "}
              {formatWorkingTime(todayAttendance.workingMinutes)}
            </>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "20px", color: "red" }}>
          <strong>Today:</strong> Not checked in yet
        </div>
      )}

      {/* ATTENDANCE TABLE */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In (IST)</th>
            <th>Check Out (IST)</th>
            <th>Working Time</th>
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
                <td>{formatWorkingTime(a.workingMinutes)}</td>
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
