import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeHeader from "./EmployeeHeader";
import { getEmployeeProfile } from "./EmployeeApi";

export default function EmployeeLayout() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getEmployeeProfile();
        setEmployee(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return null;

  return (
    <>
      <EmployeeHeader employee={employee} />

      {/* 👇 This wrapper creates space below fixed header */}
      <main style={{ paddingTop: "60px" }}>
        <Outlet />
      </main>
    </>
  );
}
