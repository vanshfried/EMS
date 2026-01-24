import { useEffect, useState } from "react";
import {
  getOfficeLocation,
  setOfficeLocation,
} from "./AdminApi";

export default function OfficeLocation() {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState(100);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =====================
     Fetch existing office
  ===================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await getOfficeLocation();
        const office = res.data.data;

        setName(office.name);
        setLatitude(office.coordinates.coordinates[1]);
        setLongitude(office.coordinates.coordinates[0]);
        setRadius(office.allowedRadiusMeters);
      } catch {
        // No office set yet — ignore
      }
    })();
  }, []);

  /* =====================
     Get current location
  ===================== */
  const fetchCurrentLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      () => setError("Location permission denied"),
      { enableHighAccuracy: true }
    );
  };

  /* =====================
     Submit location
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await setOfficeLocation({
        name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        allowedRadiusMeters: Number(radius),
      });

      setMessage("Office location saved successfully");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save office location"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>📍 Office Location Settings</h2>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <label style={styles.label}>Office Name</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Main Office"
          required
        />

        <label style={styles.label}>Latitude</label>
        <input
          style={styles.input}
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />

        <label style={styles.label}>Longitude</label>
        <input
          style={styles.input}
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />

        <button
          type="button"
          style={styles.secondaryBtn}
          onClick={fetchCurrentLocation}
        >
          📡 Use Current Location
        </button>

        <label style={styles.label}>
          Allowed Radius: <b>{radius} meters</b>
        </label>
        <input
          type="range"
          min="30"
          max="200"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          style={styles.slider}
        />

        <button style={styles.primaryBtn} disabled={loading}>
          {loading ? "Saving..." : "Save Location"}
        </button>
      </form>
    </div>
  );
}

/* =====================
   Inline Styles
===================== */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  title: {
    marginBottom: "16px",
    textAlign: "center",
  },
  label: {
    fontWeight: 600,
    marginTop: "12px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  slider: {
    width: "100%",
    marginTop: "8px",
  },
  primaryBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "10px",
    textAlign: "center",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "10px",
    textAlign: "center",
  },
};
