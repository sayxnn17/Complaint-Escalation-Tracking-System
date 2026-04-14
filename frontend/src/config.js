// ─── CONFIG ──────────────────────────────────────────────────────────────────
export const API_BASE = "https://debbie-debatable-honorifically.ngrok-free.dev";
export const CATEGORIES = ["WIFI","ELECTRICITY","HOSTEL","MAINTENANCE","GENERAL"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function getToken() { return localStorage.getItem("jwtToken"); }
export function setToken(t) { localStorage.setItem("jwtToken", t); }
export function clearToken() { localStorage.removeItem("jwtToken"); }

export function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  
  if (res.status === 401) { 
    clearToken(); 
    window.location.reload(); 
  }
  
  const text = await res.text();
  try { 
    return { ok: res.ok, data: JSON.parse(text), status: res.status }; 
  } catch { 
    return { ok: res.ok, data: text, status: res.status }; 
  }
}