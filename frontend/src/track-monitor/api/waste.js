const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api/waste-records";

const j = async (r) => {
  if (!r.ok) throw new Error(await r.text() || r.statusText);
  const ct = r.headers.get("content-type") || "";
  return ct.includes("json") ? r.json() : r.text();
};

const buildQS = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") qs.set(k, v);
  });
  return qs.toString();
};

export const WasteAPI = {
  list: (params = {}) => {
    const qs = buildQS(params);
    return fetch(`${BASE}/records${qs ? `?${qs}` : ""}`).then(j);
  },
  create: (rec) =>
    fetch(`${BASE}/records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) }).then(j),
  update: (id, rec) =>
    fetch(`${BASE}/records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) }).then(j),
  remove: (id) => fetch(`${BASE}/records/${id}`, { method: "DELETE" }).then(j),
  credits: (residentId) => fetch(`${BASE}/credits?${buildQS({ residentId })}`).then(j),
};
