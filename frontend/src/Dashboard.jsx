// frontend/src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
    navigate("/login");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16,
        padding: "48px 56px", textAlign: "center",
        boxShadow: "0 4px 32px rgba(0,0,0,.08)", maxWidth: 480,
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28, marginBottom: 8, color: "#0F172A",
        }}>
          Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}!
        </h1>
        <p style={{ color: "#64748B", marginBottom: 4 }}>
          Role: <strong>{user?.role || "—"}</strong>
        </p>
        <p style={{ color: "#64748B", marginBottom: 32 }}>
          You are signed in as <strong>@{user?.username}</strong>
        </p>
        <button onClick={logout} style={{
          padding: "12px 32px", background: "#1A6B4A",
          color: "#fff", border: "none", borderRadius: 10,
          fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit",
        }}>
          Sign Out
        </button>
        <p style={{ marginTop: 24, fontSize: 13, color: "#94A3B8" }}>
          Replace this page with your full dashboard component.
        </p>
      </div>
    </div>
  );
}
