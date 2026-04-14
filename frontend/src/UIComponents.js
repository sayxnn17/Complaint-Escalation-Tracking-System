import React from 'react';
import { CATEGORIES } from './config';

// ─── STYLE CONSTANTS ─────────────────────────────────────────────────────────
export const STATUS_COLOR = {
  OPEN: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  RESOLVED: "#22c55e",
  ESCALATED: "#ef4444",
};
export const PRIORITY_COLOR = { HIGH: "#dc2626", MEDIUM: "#f97316", LOW: "#16a34a" };
export const CAT_COLOR = ["#6366f1","#0ea5e9","#f59e0b","#10b981","#ec4899"];

// ─── REUSABLE ATOMS ──────────────────────────────────────────────────────────
export const Badge = ({ label, color }) => (
  <span style={{
    background: color, color: "#fff", padding: "2px 10px",
    borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
    textTransform: "uppercase", whiteSpace: "nowrap",
  }}>{label}</span>
);

export const StatusBadge = ({ status }) =>
  <Badge label={status?.name?.replace("_", " ")} color={STATUS_COLOR[status?.name] || "#6b7280"} />;

export const PriorityBadge = ({ priority }) =>
  <Badge label={priority?.name} color={PRIORITY_COLOR[priority?.name] || "#6b7280"} />;

export const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: 14, padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", ...style,
  }}>{children}</div>
);

export const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#374151" }}>{label}</label>}
    <input {...props} style={{
      width: "100%", padding: "10px 14px", borderRadius: 8,
      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
      boxSizing: "border-box", transition: "border .15s",
      ...(props.style || {}),
    }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

export const Textarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#374151" }}>{label}</label>}
    <textarea {...props} style={{
      width: "100%", padding: "10px 14px", borderRadius: 8,
      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
      resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
    }}
      onFocus={e => e.target.style.borderColor = "#6366f1"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

export const Select = ({ label, options, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, color: "#374151" }}>{label}</label>}
    <select {...props} style={{
      width: "100%", padding: "10px 14px", borderRadius: 8,
      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
      background: "#fff", boxSizing: "border-box",
    }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export const Btn = ({ children, variant = "primary", loading, style = {}, ...props }) => {
  const bg = { primary: "#6366f1", success: "#22c55e", warning: "#f59e0b", danger: "#ef4444", ghost: "#f3f4f6" };
  const fg = { ghost: "#374151" };
  return (
    <button {...props} disabled={loading || props.disabled} style={{
      background: bg[variant] || bg.primary,
      color: fg[variant] || "#fff",
      border: "none", borderRadius: 8, padding: "9px 20px",
      fontWeight: 600, fontSize: 13, cursor: "pointer",
      opacity: (loading || props.disabled) ? 0.6 : 1,
      transition: "opacity .15s, transform .1s",
      ...style,
    }}
      onMouseEnter={e => !loading && (e.target.style.opacity = 0.85)}
      onMouseLeave={e => !loading && (e.target.style.opacity = 1)}
    >
      {loading ? "Loading…" : children}
    </button>
  );
};

export const Alert = ({ msg, type = "error" }) => msg ? (
  <div style={{
    padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13,
    background: type === "error" ? "#fef2f2" : "#f0fdf4",
    color: type === "error" ? "#dc2626" : "#16a34a",
    border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}`,
  }}>{msg}</div>
) : null;

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
export const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120, marginTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{d.value}</span>
          <div style={{
            width: "100%", background: d.color, borderRadius: "6px 6px 0 0",
            height: Math.max((d.value / max) * 80, 4),
            transition: "height .5s ease",
          }} />
          <span style={{ fontSize: 10, color: "#6b7280", textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MINI PIE CHART ──────────────────────────────────────────────────────────
export const MiniPieChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = 60 + 55 * Math.cos(angle);
    const y1 = 60 + 55 * Math.sin(angle);
    angle += sweep;
    const x2 = 60 + 55 * Math.cos(angle);
    const y2 = 60 + 55 * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { ...d, path: `M60,60 L${x1},${y1} A55,55 0 ${large},1 ${x2},${y2} Z`, color: CAT_COLOR[i % CAT_COLOR.length] };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={120} height={120}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />)}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <span style={{ color: "#374151" }}>{s.label}</span>
            <span style={{ color: "#6b7280", fontWeight: 700 }}>({s.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── COMPLAINTS TABLE ────────────────────────────────────────────────────────
export const ComplaintsTable = ({ complaints, showStudent, showStaff, onAction }) => (
  <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #f3f4f6" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f9fafb" }}>
          {["#","Title","Category","Priority","Status",
            ...(showStudent ? ["Student"] : []),
            ...(showStaff ? ["Staff"] : []),
            "Date",
            ...(onAction ? ["Action"] : [])
          ].map(h => (
            <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {complaints.length === 0 ? (
          <tr><td colSpan={10} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>No complaints found</td></tr>
        ) : complaints.map(c => (
          <tr key={c.id} style={{ borderBottom: "1px solid #f9fafb" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <td style={{ padding: "10px 14px", color: "#9ca3af" }}>{c.id}</td>
            <td style={{ padding: "10px 14px", fontWeight: 600, maxWidth: 180 }}>{c.title}</td>
            <td style={{ padding: "10px 14px" }}>
              <Badge label={c.category?.name} color={CAT_COLOR[CATEGORIES.indexOf(c.category?.name)] || "#6366f1"} />
            </td>
            <td style={{ padding: "10px 14px" }}><PriorityBadge priority={c.priority} /></td>
            <td style={{ padding: "10px 14px" }}><StatusBadge status={c.status} /></td>
            {showStudent && <td style={{ padding: "10px 14px" }}>{c.studentName}</td>}
            {showStaff && <td style={{ padding: "10px 14px" }}>{c.assignedStaffName}</td>}
            <td style={{ padding: "10px 14px", color: "#9ca3af", whiteSpace: "nowrap" }}>
              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
            </td>
            {onAction && <td style={{ padding: "10px 14px" }}>{onAction(c)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
