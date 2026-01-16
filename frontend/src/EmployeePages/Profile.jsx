import { useEffect, useState } from "react";
import { getEmployeeProfile, updateEmployeeProfile } from "./EmployeeApi";
import styles from "./EmployeeStyles/Profile.module.css";

const Profile = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [employee, setEmployee] = useState(null);

  const [formData, setFormData] = useState({
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    emergencyContact: {
      name: "",
      relation: "",
      phone: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await getEmployeeProfile();
      const emp = res.data.employee || res.data;
      setEmployee(emp);

      setFormData({
        address: emp.address || {},
        emergencyContact: emp.emergencyContact || {},
      });
    };

    fetchProfile();
  }, []);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await updateEmployeeProfile(formData);
      setMessage("Updated successfully ✅");
    } catch {
      setMessage("Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  if (!employee) return <p>Loading...</p>;

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button
          className={`${styles.sideLink} ${
            activeSection === "profile" ? styles.active : ""
          }`}
          onClick={() => setActiveSection("profile")}
        >
          👤 Profile
        </button>

        <button
          className={`${styles.sideLink} ${
            activeSection === "address" ? styles.active : ""
          }`}
          onClick={() => setActiveSection("address")}
        >
          📍 Address
        </button>

        <button
          className={`${styles.sideLink} ${
            activeSection === "emergency" ? styles.active : ""
          }`}
          onClick={() => setActiveSection("emergency")}
        >
          🚨 Emergency Contact
        </button>
      </aside>

      {/* Content */}
      <main className={styles.content}>
        {message && <p className={styles.message}>{message}</p>}

        {/* PROFILE (READ ONLY) */}
        {activeSection === "profile" && (
          <div className={styles.card}>
            <h3>Personal Information</h3>

            <div className={styles.infoRow}>
              <span>Email</span>
              <span>{employee.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span>Name</span>
              <span>{employee.fullName}</span>
            </div>

            <div className={styles.infoRow}>
              <span>Department</span>
              <span>{employee.department}</span>
            </div>

            <div className={styles.infoRow}>
              <span>Designation</span>
              <span>{employee.designation}</span>
            </div>
          </div>
        )}

        {/* ADDRESS */}
        {activeSection === "address" && (
          <form className={styles.card} onSubmit={handleSubmit}>
            <h3>Address</h3>

            <input
              className={styles.input}
              placeholder="Street Address"
              value={formData.address.street || ""}
              onChange={(e) =>
                handleChange("address", "street", e.target.value)
              }
            />

            <div className={styles.row}>
              <input
                className={styles.input}
                placeholder="City"
                value={formData.address.city || ""}
                onChange={(e) =>
                  handleChange("address", "city", e.target.value)
                }
              />
              <input
                className={styles.input}
                placeholder="State"
                value={formData.address.state || ""}
                onChange={(e) =>
                  handleChange("address", "state", e.target.value)
                }
              />
              <input
                className={styles.input}
                placeholder="Zip Code"
                value={formData.address.zipCode || ""}
                onChange={(e) =>
                  handleChange("address", "zipCode", e.target.value)
                }
              />
            </div>

            <button className={styles.button} disabled={saving}>
              Save Changes
            </button>
          </form>
        )}

        {/* EMERGENCY */}
        {activeSection === "emergency" && (
          <form className={styles.card} onSubmit={handleSubmit}>
            <h3>Emergency Contact</h3>

            <div className={styles.row}>
              <input
                className={styles.input}
                placeholder="Name"
                value={formData.emergencyContact.name || ""}
                onChange={(e) =>
                  handleChange("emergencyContact", "name", e.target.value)
                }
              />
              <input
                className={styles.input}
                placeholder="Relation"
                value={formData.emergencyContact.relation || ""}
                onChange={(e) =>
                  handleChange("emergencyContact", "relation", e.target.value)
                }
              />
            </div>

            <input
              className={styles.input}
              placeholder="Phone"
              value={formData.emergencyContact.phone || ""}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                handleChange("emergencyContact", "phone", value);
              }}
            />

            <button className={styles.button} disabled={saving}>
              Save Changes
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Profile;
