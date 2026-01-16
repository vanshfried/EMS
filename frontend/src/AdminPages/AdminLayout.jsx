import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { getAdminProfile } from "./AdminApi";

export default function AdminLayout() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getAdminProfile();
        setAdmin(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return null;

  return (
    <>
      <AdminHeader admin={admin} />
      <Outlet />
    </>
  );
}
