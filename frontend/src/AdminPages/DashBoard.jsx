import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, adminLogout } from "./AdminApi";

export default function Dashboard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getAdminProfile();
        setEmail(res.data.email);
      } catch (err) {
        setError("Unauthorized");
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await adminLogout(); // 🔥 backend clears cookie
    } catch (err) {
      // ignore
    } finally {
      navigate("/admin/login");
    }
  };

  if (loading) return <p style={styles.center}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>
      <p>
        Logged in as: <strong>{email}</strong>
      </p>

      <button style={styles.button} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

/* =====================
   SIMPLE STYLES
===================== */
const styles = {
  container: {
    padding: "2rem",
  },
  center: {
    textAlign: "center",
    marginTop: "2rem",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  button: {
    marginTop: "1.5rem",
    padding: "10px 16px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
