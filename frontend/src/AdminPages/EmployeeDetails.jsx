import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./AdminApi";
import styles from "./AdminStyles/EmployeeDetails.module.css";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await API.get(`/admin/employees/${id}`);
        setEmployee(res.data.data);
      } catch (err) {
        setError("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
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
      <button className={styles.backBtn} onClick={() => navigate("/admin/employee-list")}>
        ← Back
      </button>

      <h2>Employee Details</h2>

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
    </div>
  );
}
