import { useEffect, useState } from "react";
import { getTodayAttendance } from "./AdminApi";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const res = await getTodayAttendance();
      setAttendance(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-6">Loading attendance...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-6">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Today’s Attendance</h1>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left border">Employee</th>
              <th className="p-3 text-left border">Email</th>
              <th className="p-3 text-left border">Check In</th>
              <th className="p-3 text-left border">Check Out</th>
              <th className="p-3 text-left border">Hours</th>
              <th className="p-3 text-left border">Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((row) => {
              const { employee, attendance: attendanceRecord } = row;

              return (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="p-3 border">{employee.fullName}</td>
                  <td className="p-3 border">{employee.email}</td>

                  <td className="p-3 border">
                    {attendanceRecord.checkInTime
                      ? new Date(
                          attendanceRecord.checkInTime,
                        ).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="p-3 border">
                    {attendanceRecord.checkOutTime
                      ? new Date(
                          attendanceRecord.checkOutTime,
                        ).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td className="p-3 border">
                    {attendanceRecord.workingHours || 0}
                  </td>

                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        attendanceRecord.status === "Absent"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {attendanceRecord.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
