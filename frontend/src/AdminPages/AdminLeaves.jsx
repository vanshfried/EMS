import { useEffect, useState } from "react";
import {
  getAllLeaves,
  reviewLeave,
  getLeavesByStatus,
} from "./AdminApi";
import styles from "./Adminstyles/AdminLeaves.module.css";

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [remarks, setRemarks] = useState({});

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res =
        filter === "All"
          ? await getAllLeaves()
          : await getLeavesByStatus(filter);

      setLeaves(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const handleAction = async (leaveId, status) => {
    try {
      await reviewLeave(leaveId, {
        status,
        adminRemarks: remarks[leaveId] || "",
      });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Leave Requests</h1>

      {/* =====================
          FILTER BAR
      ===================== */}
      <div className={styles.filterBar}>
        {["All", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            className={`${styles.filterBtn} ${
              filter === s ? styles.active : ""
            }`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* =====================
          TABLE
      ===================== */}
      <div className={styles.card}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : leaves.length === 0 ? (
          <p className={styles.empty}>No leave requests found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    <strong>{leave.employee.fullName}</strong>
                    <br />
                    <span className={styles.muted}>
                      {leave.employee.email}
                    </span>
                  </td>

                  <td>{leave.employee.department}</td>
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
                    {leave.status === "Pending" ? (
                      <input
                        className={styles.remarksInput}
                        placeholder="Remarks (optional)"
                        value={remarks[leave._id] || ""}
                        onChange={(e) =>
                          setRemarks({
                            ...remarks,
                            [leave._id]: e.target.value,
                          })
                        }
                      />
                    ) : (
                      leave.adminRemarks || "-"
                    )}
                  </td>

                  <td>
                    {leave.status === "Pending" && (
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.approveBtn}
                          onClick={() =>
                            handleAction(leave._id, "Approved")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() =>
                            handleAction(leave._id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
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

export default AdminLeaves;
