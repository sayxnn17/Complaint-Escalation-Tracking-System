

import React, { useState } from "react";
import { 
  getToken, decodeJWT, clearToken, apiFetch, setToken, CATEGORIES 
} from "./config";
import { 
  Card, Badge, Input, Select, Btn, Alert 
} from "./UIComponents";
import { 
  StudentDashboard, StaffDashboard, AdminDashboard 
} from "./Dashboards";

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT", department: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    setLoading(true); setError("");
    const { ok, data } = await apiFetch("/api/auth/login", {
      method: "POST", body: JSON.stringify({ email: form.email, password: form.password }),
    });
    setLoading(false);
    if (!ok) { setError(typeof data === "string" ? data : "Login failed"); return; }
    setToken(data);
    onLogin(decodeJWT(data));
  };

  const handleSignup = async () => {
    setLoading(true); setError("");
    const body = { name: form.name, email: form.email, password: form.password, role: form.role, department: form.role === "STAFF" ? form.department : null };
    const { ok, data } = await apiFetch("/api/auth/signup", { method: "POST", body: JSON.stringify(body) });
    setLoading(false);
    if (!ok) { setError(typeof data === "string" ? data : "Signup failed"); return; }
    setMode("login"); setError(""); alert("Account created! Please log in.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#eef2ff 0%,#f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',sans-serif" }}>
      <Card style={{ width: 380, maxWidth: "95vw" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: "#6366f1", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 22, color: "#fff" }}>📋</span>
          </div>
          <h2 style={{ margin: 0, fontWeight: 700, color: "#1e1b4b" }}>Complaint Manager</h2>
        </div>
        <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 8, padding: 3, marginBottom: 20 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "8px", border: "none", borderRadius: 6,
              background: mode === m ? "#fff" : "transparent",
              fontWeight: mode === m ? 700 : 500, color: mode === m ? "#6366f1" : "#6b7280",
              cursor: "pointer", fontSize: 13,
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            }}>{m === "login" ? "Log In" : "Sign Up"}</button>
          ))}
        </div>
        <Alert msg={error} />
        {mode === "login" ? (
          <>
            <Input label="Email" type="email" placeholder="you@college.edu" value={form.email} onChange={e => set("email", e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} />
            <Btn style={{ width: "100%", padding: "11px" }} loading={loading} onClick={handleLogin}>Log In</Btn>
          </>
        ) : (
          <>
            <Input label="Full Name" placeholder="Your Name" value={form.name} onChange={e => set("name", e.target.value)} />
            <Input label="Email" type="email" placeholder="you@college.edu" value={form.email} onChange={e => set("email", e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} />
            <Select label="Role" value={form.role} onChange={e => set("role", e.target.value)} options={[{ value: "STUDENT", label: "Student" }, { value: "STAFF", label: "Staff" }]} />
            {form.role === "STAFF" && <Select label="Department" value={form.department} onChange={e => set("department", e.target.value)} options={[{ value: "", label: "Select Dept" }, ...CATEGORIES.slice(0, 4).map(c => ({ value: c, label: c }))]} />}
            <Btn style={{ width: "100%", padding: "11px" }} loading={loading} onClick={handleSignup}>Create Account</Btn>
          </>
        )}
      </Card>
    </div>
  );
};

// ─── NAV BAR ──────────────────────────────────────────────────────────────────
const NavBar = ({ user, onLogout, tabs }) => (
  <div style={{
    background: "#fff", borderBottom: "1px solid #f3f4f6",
    display: "flex", alignItems: "center", padding: "0 28px",
    height: 56, gap: 24, position: "sticky", top: 0, zIndex: 10,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 12 }}>
      <span style={{ fontSize: 18 }}>📋</span>
      <span style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>Complaint Manager</span>
    </div>
    <div style={{ display: "flex", gap: 4, flex: 1 }}>
      {tabs.map(t => (
        <button key={t.id} style={{
          border: "none", background: "#eef2ff", color: "#6366f1",
          padding: "6px 14px", borderRadius: 6, cursor: "default",
          fontWeight: 700, fontSize: 13,
        }}>{t.icon} {t.label}</button>
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
        {user?.sub?.[0]?.toUpperCase()}
      </div>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{user?.sub}</span>
      <Badge label={user?.role} color={user?.role === "ADMIN" ? "#7c3aed" : user?.role === "STAFF" ? "#0ea5e9" : "#10b981"} />
      <button onClick={onLogout} style={{ border: "1px solid #e5e7eb", background: "transparent", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#6b7280" }}>Logout</button>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(() => {
    const token = getToken();
    return token ? decodeJWT(token) : null;
  });

  const handleLogout = () => { clearToken(); setUser(null); };

  if (!user) return <AuthScreen onLogin={setUser} />;

  const navTabs = [{ id: "dashboard", label: user.role === "STAFF" ? "My Cases" : "Dashboard", icon: "🏠" }];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI',sans-serif" }}>
      <NavBar user={user} onLogout={handleLogout} tabs={navTabs} />
      {user.role === "STUDENT" && <StudentDashboard />}
      {user.role === "STAFF" && <StaffDashboard />}
      {user.role === "ADMIN" && <AdminDashboard />}
    </div>
  );
}
