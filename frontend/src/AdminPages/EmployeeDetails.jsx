import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./AdminApi";
import styles from "./AdminStyles/EmployeeDetails.module.css";

/* =====================
   HELPERS
===================== */

const formatTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const formatWorkingTime = (minutes) => {
  if (!minutes || minutes <= 0) return "0h 0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

/* =====================
   COMPONENT
===================== */

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attRes] = await Promise.all([
          API.get(`/admin/employees/${id}`),
          API.get(`/admin/employees/${id}/attendance`),
        ]);

        setEmployee(empRes.data.data);
        setAttendance(attRes.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <p className={styles.center}>Loading employee details...</p>;
  }

  if (error) {
    return <p className={`${styles.center} ${styles.error}`}>{error}</p>;
  }

  if (!employee) {
    return <p className={styles.center}>Employee not found</p>;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/admin/employee-list")}
      >
        ← Back
      </button>

      <h2>Employee Details</h2>

      {/* BASIC DETAILS */}
      <div className={styles.card}>
        <section>
          <h3>Basic Information</h3>
          <p>
            <strong>Full Name:</strong> {employee.fullName}
          </p>
          <p>
            <strong>Email:</strong> {employee.email}
          </p>
          <p>
            <strong>Department:</strong> {employee.department}
          </p>
          <p>
            <strong>Designation:</strong> {employee.designation}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={employee.isActive ? styles.active : styles.inactive}
            >
              {employee.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </section>

        <section>
          <h3>Address</h3>
          {employee.address ? (
            <>
              <p>{employee.address.street}</p>
              <p>
                {employee.address.city}, {employee.address.state}{" "}
                {employee.address.zipCode}
              </p>
            </>
          ) : (
            <p>Not provided</p>
          )}
        </section>

        <section>
          <h3>Emergency Contact</h3>
          {employee.emergencyContact ? (
            <>
              <p>
                <strong>Name:</strong> {employee.emergencyContact.name}
              </p>
              <p>
                <strong>Relation:</strong> {employee.emergencyContact.relation}
              </p>
              <p>
                <strong>Phone:</strong> {employee.emergencyContact.phone}
              </p>
            </>
          ) : (
            <p>Not provided</p>
          )}
        </section>

        <section>
          <h3>System Info</h3>
          <p>
            <strong>Registered By:</strong> {employee.createdByAdminEmail}
          </p>
        </section>
      </div>

      {/* ATTENDANCE DETAILS */}
      <div className={styles.attendanceSection}>
        <h3 className={styles.attendanceTitle}>Attendance History</h3>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
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
                  <td colSpan="5" className={styles.center}>
                    No attendance records
                  </td>
                </tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a._id}>
                    <td>{new Date(a.date).toLocaleDateString("en-IN")}</td>
                    <td
                      className={
                        a.status === "Present"
                          ? styles.present
                          : a.status === "Half Day"
                            ? styles.halfDay
                            : a.status === "Leave"
                              ? styles.leave
                              : styles.absent
                      }
                    >
                      {a.status}
                    </td>
                    <td>{formatWorkingTime(a.workingMinutes)}</td>
                    <td>{formatTime(a.checkInTime)}</td>
                    <td>{formatTime(a.checkOutTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
