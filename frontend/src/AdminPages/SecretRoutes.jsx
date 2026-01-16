import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAdminProfile } from "./AdminApi";

export default function SecretRoute() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getAdminProfile(); // 🔥 cookie auto-sent
        setAuthorized(true);
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;
  }

  return authorized ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
