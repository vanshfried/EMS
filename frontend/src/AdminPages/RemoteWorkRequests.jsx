import { useEffect, useState } from "react";
import {
  getRemoteWorkRequests,
  approveRemoteWorkRequest,
  rejectRemoteWorkRequest,
} from "./AdminApi";

const RemoteWorkRequests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await getRemoteWorkRequests();
      return res.data.data || [];
    } catch (error) {
      console.error(error);
      alert("Failed to load requests");
      return [];
    }
  };

  useEffect(() => {
    const loadRequests = async () => {
      const data = await fetchRequests();
      setRequests(data);
    };

    loadRequests();
  }, []);
  const handleApprove = async (id) => {
    try {
      await approveRemoteWorkRequest(id);

      alert("Request approved");

      const res = await getRemoteWorkRequests();
      setRequests(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    const rejectionReason = prompt("Enter rejection reason (optional):") || "";

    try {
      await rejectRemoteWorkRequest(id, rejectionReason);

      alert("Request rejected");

      const res = await getRemoteWorkRequests();
      setRequests(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject request");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🏠 Remote Work Requests</h2>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="6" align="center">
                No Requests
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request._id}>
                <td>{request.employee.fullName}</td>
                <td>{request.employee.department}</td>
                <td>{new Date(request.date).toLocaleDateString()}</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>

                <td>
                  {request.status === "Pending" ? (
                    <>
                      <button onClick={() => handleApprove(request._id)}>
                        Approve
                      </button>

                      <button
                        style={{ marginLeft: "8px" }}
                        onClick={() => handleReject(request._id)}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    request.status
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RemoteWorkRequests;
