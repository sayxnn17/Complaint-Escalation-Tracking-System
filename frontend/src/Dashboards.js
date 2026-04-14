import React, { useState, useEffect, useCallback } from "react";
import { apiFetch, CATEGORIES } from "./config";
import { 
  Card, Btn, Alert, Input, Textarea, ComplaintsTable, 
  MiniBarChart, MiniPieChart, STATUS_COLOR, CAT_COLOR 
} from "./UIComponents";

// ─── STUDENT DASHBOARD ────────────────────────────────────────────────────────
export const StudentDashboard = () => {
  const [tab, setTab] = useState("submit");
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchComplaints = useCallback(async () => {
    setLoadingList(true);
    const { ok, data } = await apiFetch("/api/complaints/my");
    setLoadingList(false);
    if (ok) setComplaints(data);
  }, []);

  useEffect(() => { if (tab === "list") fetchComplaints(); }, [tab, fetchComplaints]);

  const handleSubmit = async () => {
    if (!form.title || !form.description) { setError("Please fill in all fields"); return; }
    setSubmitting(true); setError(""); setSuccess("");
    const { ok, data } = await apiFetch("/api/complaints", { method: "POST", body: JSON.stringify(form) });
    setSubmitting(false);
    if (!ok) { setError(typeof data === "string" ? data : "Submission failed"); return; }
    setSuccess(`✓ Submitted! Category: ${data.category?.name} | Priority: ${data.priority?.name} | Assigned to: ${data.assignedStaffName}`);
    setForm({ title: "", description: "" });
  };

  const tabs = [{ id: "submit", label: "Submit Complaint", icon: "✏️" }, { id: "list", label: "My Complaints", icon: "📄" }];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900, margin: "0 auto", fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(""); setSuccess(""); }} style={{
            border: "none", background: tab === t.id ? "#6366f1" : "#f3f4f6",
            color: tab === t.id ? "#fff" : "#6b7280", padding: "8px 18px",
            borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
      {tab === "submit" && (
        <Card style={{ maxWidth: 560 }}>
          <h3 style={{ margin: "0 0 20px", color: "#1e1b4b" }}>Submit a New Complaint</h3>
          <Alert msg={error} /><Alert msg={success} type="success" />
          <Input label="Title" placeholder="Brief title of your complaint" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Description" placeholder="Describe your issue in detail..." rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>✨ AI will automatically classify category & priority and assign to the right staff.</p>
          <Btn loading={submitting} onClick={handleSubmit}>Submit Complaint</Btn>
        </Card>
      )}
      {tab === "list" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#1e1b4b" }}>My Complaints</h3>
            <Btn variant="ghost" onClick={fetchComplaints} loading={loadingList}>↻ Refresh</Btn>
          </div>
          <ComplaintsTable complaints={complaints} showStaff />
        </Card>
      )}
    </div>
  );
};

// ─── STAFF DASHBOARD ──────────────────────────────────────────────────────────
export const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await apiFetch("/api/complaints/assigned");
    setLoading(false);
    if (ok) setComplaints(data);
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    const { ok, data } = await apiFetch(`/api/complaints/status?id=${id}&status=${status}`, { method: "PUT" });
    setUpdating(null);
    if (!ok) { alert(typeof data === "string" ? data : "Update failed"); return; }
    fetchComplaints();
  };

  const openCount = complaints.filter(c => c.status?.name === "OPEN").length;
  const inProgressCount = complaints.filter(c => c.status?.name === "IN_PROGRESS").length;
  const escalatedCount = complaints.filter(c => c.status?.name === "ESCALATED").length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto", fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Open", value: openCount, color: STATUS_COLOR.OPEN },
          { label: "In Progress", value: inProgressCount, color: STATUS_COLOR.IN_PROGRESS },
          { label: "Escalated", value: escalatedCount, color: STATUS_COLOR.ESCALATED },
          { label: "Total", value: complaints.length, color: "#6366f1" },
        ].map(s => (
          <Card key={s.label} style={{ flex: 1, minWidth: 120, textAlign: "center", padding: "16px 20px" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "#1e1b4b" }}>Assigned Complaints</h3>
          <Btn variant="ghost" onClick={fetchComplaints} loading={loading}>↻ Refresh</Btn>
        </div>
        <ComplaintsTable
          complaints={complaints}
          showStudent
          onAction={(c) => {
            const s = c.status?.name;
            if (s === "OPEN") return <Btn variant="primary" loading={updating === c.id} onClick={() => updateStatus(c.id, "IN_PROGRESS")} style={{ fontSize: 12, padding: "5px 12px" }}>Start</Btn>;
            if (s === "IN_PROGRESS") return <Btn variant="success" loading={updating === c.id} onClick={() => updateStatus(c.id, "RESOLVED")} style={{ fontSize: 12, padding: "5px 12px" }}>Resolve</Btn>;
            if (s === "ESCALATED") return <Btn variant="warning" loading={updating === c.id} onClick={() => updateStatus(c.id, "IN_PROGRESS")} style={{ fontSize: 12, padding: "5px 12px" }}>Resume</Btn>;
            return <span style={{ fontSize: 12, color: "#9ca3af" }}>✓ Done</span>;
          }}
        />
      </Card>
    </div>
  );
};

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filterCat, setFilterCat] = useState("WIFI");
  const [loading, setLoading] = useState(true);
  const [loadingFilter, setLoadingFilter] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/complaints/analytics"),
      apiFetch("/api/complaints/categories/summary"),
      apiFetch("/api/complaints"),
    ]).then(([a, s, c]) => {
      if (a.ok) setAnalytics(a.data);
      if (s.ok) setSummary(s.data);
      if (c.ok) setAllComplaints(c.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeTab !== "filter") return;
    setLoadingFilter(true);
    apiFetch(`/api/complaints/category/${filterCat}`).then(({ ok, data }) => {
      setLoadingFilter(false);
      if (ok) setFilteredComplaints(data);
    });
  }, [filterCat, activeTab]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading dashboard…</div>;

  const barData = analytics ? [
    { label: "Open", value: analytics.open || 0, color: STATUS_COLOR.OPEN },
    { label: "In Progress", value: analytics.in_progress || 0, color: STATUS_COLOR.IN_PROGRESS },
    { label: "Resolved", value: analytics.resolved || 0, color: STATUS_COLOR.RESOLVED },
    { label: "Escalated", value: analytics.escalated || 0, color: STATUS_COLOR.ESCALATED },
  ] : [];

  const pieData = summary ? Object.entries(summary).map(([k, v], i) => ({ label: k, value: v, color: CAT_COLOR[i] })) : [];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto", fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "complaints", label: "All Complaints", icon: "📋" },
          { id: "filter", label: "Filter by Category", icon: "🔍" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            border: "none", background: activeTab === t.id ? "#6366f1" : "#f3f4f6",
            color: activeTab === t.id ? "#fff" : "#6b7280",
            padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {activeTab === "overview" && analytics && (
        <>
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: analytics.total, color: "#6366f1" },
              { label: "Open", value: analytics.open, color: STATUS_COLOR.OPEN },
              { label: "In Progress", value: analytics.in_progress, color: STATUS_COLOR.IN_PROGRESS },
              { label: "Resolved", value: analytics.resolved, color: STATUS_COLOR.RESOLVED },
              { label: "Escalated", value: analytics.escalated, color: STATUS_COLOR.ESCALATED },
              { label: "Res. Rate", value: `${Math.round(((analytics.resolved || 0) / (analytics.total || 1)) * 100)}%`, color: "#10b981" },
            ].map(s => (
              <Card key={s.label} style={{ flex: 1, minWidth: 110, textAlign: "center", padding: "16px 20px" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card><h4 style={{ margin: "0 0 16px" }}>Status Distribution</h4><MiniBarChart data={barData} /></Card>
            <Card><h4 style={{ margin: "0 0 16px" }}>Category Breakdown</h4><MiniPieChart data={pieData} /></Card>
          </div>
        </>
      )}
      {activeTab === "complaints" && (
        <Card><h3 style={{ margin: "0 0 16px" }}>All Complaints ({allComplaints.length})</h3><ComplaintsTable complaints={allComplaints} showStudent showStaff /></Card>
      )}
      {activeTab === "filter" && (
        <Card>
          <h3>Filter by Category</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat, i) => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                border: "none", borderRadius: 20, padding: "6px 16px",
                background: filterCat === cat ? CAT_COLOR[i] : "#f3f4f6",
                color: filterCat === cat ? "#fff" : "#6b7280",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>{cat}</button>
            ))}
          </div>
          {loadingFilter ? <p>Loading…</p> : <ComplaintsTable complaints={filteredComplaints} showStudent showStaff />}
        </Card>
      )}
    </div>
  );
};