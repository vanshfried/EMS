import { useEffect, useState } from "react";
import {
  applyLeave,
  getMyLeaves,
  cancelLeave,
} from "./EmployeeApi";
import styles from "./EmployeeStyles/EmployeeLeaves.module.css";

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getMyLeaves();
      setLeaves(res.data.leaves);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await applyLeave(formData);
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;

    try {
      await cancelLeave(id);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel leave");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Leave Management</h1>

      {/* =====================
          APPLY LEAVE CARD
      ===================== */}
      <div className={styles.card}>
        <h2>Apply for Leave</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label>Leave Type</label>
            <select
              required
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({ ...formData, leaveType: e.target.value })
              }
            >
              <option value="">Select</option>
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label>Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div className={styles.formRow}>
            <label>End Date</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>

          <div className={styles.formRowFull}>
            <label>Reason</label>
            <textarea
              required
              rows="3"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </div>

          <button
            className={styles.primaryBtn}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Apply Leave"}
          </button>
        </form>
      </div>

      {/* =====================
          LEAVE HISTORY
      ===================== */}
      <div className={styles.card}>
        <h2>Leave History</h2>

        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : leaves.length === 0 ? (
          <p className={styles.empty}>No leave records found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.leaveType}</td>
                  <td>{leave.startDate.slice(0, 10)}</td>
                  <td>{leave.endDate.slice(0, 10)}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[leave.status.toLowerCase()]
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.status === "Pending" && (
                      <button
                        className={styles.dangerBtn}
                        onClick={() => handleCancel(leave._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeaves;
