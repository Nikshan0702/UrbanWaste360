// frontend/src/track-monitor/api/waste.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api/waste-records";

const j = async (r) => {
  const ct = r.headers.get("content-type") || "";
  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(errText || `${r.status} ${r.statusText}`);
  }
  return ct.includes("json") ? r.json() : r.text();
};

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQS = (params = {}) =>
  new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
  ).toString();

export const WasteAPI = {
  list: (params = {}) => {
    const qs = buildQS(params);
    return fetch(`${BASE}/records${qs ? `?${qs}` : ""}`, {
      method: "GET",
      headers: { ...authHeaders() },
    }).then(j);
  },
  create: (rec) =>
    fetch(`${BASE}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(rec),
    }).then(j),
  update: (id, rec) =>
    fetch(`${BASE}/records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(rec),
    }).then(j),
  remove: (id) =>
    fetch(`${BASE}/records/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    }).then(j),
  // If security is disabled, pass residentId explicitly
  credits: (residentId) => {
  const token = localStorage.getItem("authToken");
  const qs = residentId ? `?residentId=${encodeURIComponent(residentId)}` : "";

  return fetch(`${BASE}/credits${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(j);
},

};





// // /src/api/waste.js
// const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api/waste-records";

// const j = async (r) => {
//   const ct = r.headers.get("content-type") || "";
//   if (!r.ok) {
//     // read body ONCE on error
//     const errText = await r.text().catch(() => "");
//     const msg = errText || `${r.status} ${r.statusText}`;
//     // surface status + body to your catch()
//     throw new Error(JSON.stringify({ status: r.status, message: msg }));
//   }
//   // read body ONCE on success
//   if (ct.includes("json")) return r.json();
//   return r.text();
// };

// const authHeaders = () => {
//   const token = localStorage.getItem("authToken");   // <-- set this after login
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// const buildQS = (params = {}) =>
//   new URLSearchParams(
//     Object.entries(params).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
//   ).toString();

// export const WasteAPI = {
//   list: (params = {}) => {
//     const qs = buildQS(params);
//     return fetch(`${BASE}/records${qs ? `?${qs}` : ""}`, {
//       method: "GET",
//       headers: { ...authHeaders() },
//     }).then(j);
//   },
//   create: (rec) =>
//     fetch(`${BASE}/records`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...authHeaders() },
//       body: JSON.stringify(rec),
//     }).then(j),
//   update: (id, rec) =>
//     fetch(`${BASE}/records/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json", ...authHeaders() },
//       body: JSON.stringify(rec),
//     }).then(j),
//   remove: (id) =>
//     fetch(`${BASE}/records/${id}`, {
//       method: "DELETE",
//       headers: { ...authHeaders() },
//     }).then(j),
//   credits: () =>
//     fetch(`${BASE}/credits`, {
//       headers: { ...authHeaders() },
//     }).then(j),
// };
