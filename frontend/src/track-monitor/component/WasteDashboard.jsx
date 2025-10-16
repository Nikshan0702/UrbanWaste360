// import React, { useEffect, useMemo, useState } from "react";
// import { WasteAPI } from "../api/waste";
// import { Line, Pie } from "react-chartjs-2";
// import { faker } from '@faker-js/faker';
// import {
//   Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend,
// } from "chart.js";
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

// const TYPES = ["Organic","Plastic","Paper","Glass","Metal","Other"];

// export default function WasteDashboard({
//    residentId = "user123",
//    showHeaderCards = true,
//    showCredits = true,
//    showForm = true
// }){
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({ from:"", to:"", type:"" });
//   const [form, setForm] = useState({ date:"", type:"Plastic", quantity:"", unit:"kg", notes:"" });
//   const [editing, setEditing] = useState(null);
//   const [credits, setCredits] = useState(0);
//   const [deviceLinked, setDeviceLinked] = useState(true); // toggle to show E2

//   const load = async () => {
//     setLoading(true);
//     try {
//       const data = await WasteAPI.list({ residentId, ...filters });
//       setRecords(data);
//       const c = await WasteAPI.credits(residentId);
//       setCredits(c.points ?? c);
//     } catch (e) {
//       console.error(e);
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { load(); }, []); // initial
//   const applyFilters = async () => load();

//   const totalsByType = useMemo(() => {
//     const map = Object.fromEntries(TYPES.map(t => [t, 0]));
//     records.forEach(r => { map[r.type] = (map[r.type] || 0) + Number(r.quantity || 0); });
//     return map;
//   }, [records]);

  
  
// //   const lineData = useMemo(() => {
// //     const byDay = {};
// //     records.forEach(r => {
// //       const d = r.date?.slice(0,10);
// //       byDay[d] = (byDay[d] || 0) + Number(r.quantity || 0);
// //     });
// //     const labels = Object.keys(byDay).sort();
// //     return { labels, datasets: [{ label: "Total (kg)", data: labels.map(l => byDay[l]), tension: 0.3 }] };
// //   }, [records]);

// const lineData = useMemo(() => {
//   const byType = {};
//   records.forEach(r => {
//     const d = r.date?.slice(0,10);
//     byType[r.type] = byType[r.type] || {};
//     byType[r.type][d] = (byType[r.type][d] || 0) + Number(r.quantity || 0);
//   });

//   const labels = Array.from(new Set(records.map(r => r.date?.slice(0,10)))).sort();

//   const colorMap = {
//     Organic: "#16a34a",
//     Plastic: "#3b82f6",
//     Paper: "#facc15",
//     Glass: "#f87171",
//     Metal: "#a855f7",
//     Other: "#9ca3af",
//   };

//   const datasets = Object.keys(byType).map(type => ({
//     label: type,
//     data: labels.map(l => byType[type][l] || 0),
//     borderColor: colorMap[type] || "#64748b",
//     backgroundColor: `${colorMap[type]}33`, // translucent fill
//     tension: 0.3,
//     fill: true,
//   }));

//   return { labels, datasets };
// }, [records]);




// //   const pieData = useMemo(() => ({
// //     labels: Object.keys(totalsByType),
// //     datasets: [{ data: Object.values(totalsByType) }]
// //   }), [totalsByType]);

//     const pieData = useMemo(() => ({
//         labels: Object.keys(totalsByType),
//         datasets: [{
//             data: Object.values(totalsByType),
//             backgroundColor: [
//             "#16a34a", // Organic - green
//             "#3b82f6", // Plastic - blue
//             "#facc15", // Paper - yellow
//             "#f87171", // Glass - red
//             "#a855f7", // Metal - purple
//             "#9ca3af", // Other - gray
//             ],
//             borderColor: "#fff",
//             borderWidth: 2,
//         }]
//     }), [totalsByType]);



//   const resetForm = () => { setForm({ date:"", type:"Plastic", quantity:"", unit:"kg", notes:"" }); setEditing(null); };
//   const submit = async (e) => {
//     e.preventDefault();
//     const payload = { ...form, quantity: Number(form.quantity), residentId, source:"manual" };
//     if (editing) await WasteAPI.update(editing, payload); else await WasteAPI.create(payload);
//     resetForm(); await load();
//   };
//   const del = async (id) => { if (confirm("Delete record?")) { await WasteAPI.remove(id); await load(); } };
//   const toCSV = () => {
//     const head = ["date","type","quantity","unit","notes"];
//     const rows = records.map(r => head.map(h => r[h] ?? "").join(","));
//     const csv = [head.join(","), ...rows].join("\n");
//     const blob = new Blob([csv], { type:"text/csv" });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob); a.download = "waste-data.csv"; a.click();
//   };

//   // Exception flows
//   if (!deviceLinked) {
//     return (
//       <div className="p-6">
//         <div className="rounded-xl border p-6 bg-amber-50 border-amber-200">
//           <h2 className="text-lg font-semibold mb-2">No linked device</h2>
//           <p className="text-sm text-amber-800">
//             (E2) You don’t have a smart bin linked. Please register a device to see real-time data.
//           </p>
//           <button className="mt-3 rounded-lg bg-emerald-600 text-white px-4 py-2">Register Device</button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header cards */}
//       {/* <div className="grid md:grid-cols-3 gap-4">
//         <Card title="Total Waste (kg) This Month">
//           {records.reduce((s,r)=>s + (new Date(r.date).getMonth()===new Date().getMonth() ? Number(r.quantity||0) : 0),0).toFixed(1)}
//         </Card>
//         <Card title="Recycling Credits">{credits}</Card>
//         <Card title="Trend (7d)">
//           {lineData.labels.length ? `${((lineData.datasets[0].data.at(-1) || 0) - (lineData.datasets[0].data[0] || 0)) >= 0 ? "↑" : "↓"}`
//             : "—"}
//         </Card>
//       </div> */}

//        {showHeaderCards && (
//       <div className="grid md:grid-cols-3 gap-4">
//         <Card title="Total Waste (kg) This Month"> {records.reduce((s,r)=>s + (new Date(r.date).getMonth()===new Date().getMonth() ? Number(r.quantity||0) : 0),0).toFixed(1)} </Card>
//         {showCredits && <Card title="Recycling Credits">{credits}</Card>}
//         <Card title="Trend (7d)"> {lineData.labels.length ? `${((lineData.datasets[0].data.at(-1) || 0) - (lineData.datasets[0].data[0] || 0)) >= 0 ? "↑" : "↓"}`
//             : "—"} </Card>
//       </div>
//       )}

//       {/* Filters */}
//       <div className="rounded-xl border p-4 bg-white">
//         <div className="flex flex-wrap gap-3 items-end">
//           <div>
//             <label className="text-xs text-slate-500">From</label>
//             <input type="date" value={filters.from} onChange={e=>setFilters(f=>({...f,from:e.target.value}))}
//               className="block rounded-lg border px-3 py-2"/>
//           </div>
//           <div>
//             <label className="text-xs text-slate-500">To</label>
//             <input type="date" value={filters.to} onChange={e=>setFilters(f=>({...f,to:e.target.value}))}
//               className="block rounded-lg border px-3 py-2"/>
//           </div>
//           <div>
//             <label className="text-xs text-slate-500">Type</label>
//             <select value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}
//               className="block rounded-lg border px-3 py-2">
//               <option value="">All</option>
//               {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//             </select>
//           </div>
//           <button onClick={applyFilters} className="rounded-lg bg-slate-900 text-white px-4 py-2">Apply</button>
//           <button onClick={toCSV} className="rounded-lg border px-4 py-2">Download CSV</button>
//           <button onClick={()=>window.print()} className="rounded-lg border px-4 py-2">Print/PDF</button>
//         </div>
//       </div>

//       {/* Charts + Credits badge */}
//       <div className="grid lg:grid-cols-3 gap-4">
//         <div className="rounded-xl border p-4 bg-white lg:col-span-2">
//           <h3 className="font-semibold mb-2">Waste Generation</h3>
//           <Line data={lineData} />
//         </div>
//         <div className="rounded-xl border p-4 bg-white">
//           <h3 className="font-semibold mb-2">Waste Categories</h3>
//           <Pie data={pieData} />
//         </div>
//       </div>

//       {/* CRUD form */}
//       <div className="grid lg:grid-cols-3 gap-4">
//         {showForm && (
//         <div className="rounded-xl border p-4 bg-white">
//           <h3 className="font-semibold mb-3">{editing ? "Edit Record" : "Add Record"}</h3>
//           <form className="space-y-3" onSubmit={submit}>
//             <input type="date" required value={form.date}
//               onChange={e=>setForm(f=>({...f,date:e.target.value}))}
//               className="w-full rounded-lg border px-3 py-2"/>
//             <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
//               className="w-full rounded-lg border px-3 py-2">
//               {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//             </select>
//             <div className="flex gap-2">
//               <input type="number" min="0" step="0.1" required placeholder="Quantity"
//                 value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}
//                 className="flex-1 rounded-lg border px-3 py-2"/>
//               <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}
//                 className="w-28 rounded-lg border px-3 py-2"><option>kg</option><option>L</option></select>
//             </div>
//             <input placeholder="Notes (optional)" value={form.notes}
//               onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
//               className="w-full rounded-lg border px-3 py-2"/>
//             <div className="flex gap-2">
//               <button className="rounded-lg bg-emerald-600 text-white px-4 py-2">{editing ? "Update" : "Create"}</button>
//               {editing && <button type="button" onClick={()=>setEditing(null)} className="rounded-lg border px-4 py-2">Cancel</button>}
//             </div>
//           </form>
//         </div>
//         )}

//         {/* Records table (CRUD list + actions) */}
//         <div className={`${showForm ? "lg:col-span-2" : "lg:col-span-3"} rounded-xl border p-4 bg-white overflow-auto`}>
//           <table className="min-w-full text-sm">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="text-left px-3 py-2">Date</th>
//                 <th className="text-left px-3 py-2">Type</th>
//                 <th className="text-left px-3 py-2">Qty</th>
//                 <th className="text-left px-3 py-2">Unit</th>
//                 <th className="text-left px-3 py-2">Source</th>
//                 <th className="text-left px-3 py-2">Notes</th>
//                 <th className="text-left px-3 py-2">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {!records.length && (
//                 <tr>
//                   <td colSpan="7" className="px-3 py-8 text-center text-slate-500">
//                     (E1) No new data. Last synced: {new Date().toLocaleString()}
//                   </td>
//                 </tr>
//               )}
//               {records.map(r => (
//                 <tr key={r.id} className="border-t">
//                   <td className="px-3 py-2">{r.date?.slice(0,10)}</td>
//                   <td className="px-3 py-2">{r.type}</td>
//                   <td className="px-3 py-2">{r.quantity}</td>
//                   <td className="px-3 py-2">{r.unit}</td>
//                   <td className="px-3 py-2">{r.source}</td>
//                   <td className="px-3 py-2">{r.notes}</td>
//                   <td className="px-3 py-2">
//                     <div className="flex gap-2">
//                       <button className="rounded-md bg-slate-800 text-white px-3 py-1"
//                         onClick={()=>{ setEditing(r.id); setForm({ date:r.date?.slice(0,10), type:r.type, quantity:r.quantity, unit:r.unit, notes:r.notes||"" }); }}>
//                         Edit
//                       </button>
//                       <button className="rounded-md bg-rose-600 text-white px-3 py-1"
//                         onClick={()=>del(r.id)}>
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Card({ title, children }) {
//   return (
//     <div className="rounded-xl border p-4 bg-white">
//       <div className="text-xs text-slate-500">{title}</div>
//       <div className="text-2xl font-semibold mt-1">{children}</div>
//     </div>
//   );
// }









import React, { useEffect, useMemo, useState } from "react";
import { WasteAPI } from "../api/waste";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

const TYPES = ["Organic","Plastic","Paper","Glass","Metal","Other"];
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api/waste-records";


export default function WasteDashboard({
  // what to show on this page:
  showHeaderCards = true,
  showCredits = true,
  showFilters = true,
  showCharts = true,
  showBar = false,
  showForm = true,          // show create/edit form
  showTable = true,         // show full CRUD table
  showSummaryList = false,  // show compact summary list (Dashboard)
  summaryCount = 5,         // how many rows in summary
  showMiniSummary = false, 
}) {
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from:"", to:"", type:"" });
  const [form, setForm] = useState({ date:"", type:"Plastic", quantity:"", unit:"kg", notes:"" });
  const [editing, setEditing] = useState(null);
  const [credits, setCredits] = useState(0);
  const [deviceLinked, setDeviceLinked] = useState(true); // toggle to show E2

  // --- auth + user ---
  const token = localStorage.getItem("authToken") || "";
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("userData") || "{}"); } catch { return {}; }
  })();
  const userId = storedUser?.id || storedUser?._id || storedUser?.userId || ""; // your unique user id

  // --- helper: client-side filter for current user + UI filters ---
  const applyLocalFilters = (rows) => {
    let list = rows;

    // Keep only current user’s rows if backend isn’t filtering
    if (userId) list = list.filter(r => r.residentId === userId);

    if (filters.type) list = list.filter(r => r.type === filters.type);
    if (filters.from) list = list.filter(r => (r.date || "").slice(0,10) >= filters.from);
    if (filters.to)   list = list.filter(r => (r.date || "").slice(0,10) <= filters.to);

    return list;
  };


  const kpis = useMemo(() => {
  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();

  let totalThisMonth = 0, total7d = 0, total30d = 0;
  const typeTotals = {};
  let latestDate = null;




  records.forEach(r => {
    const d = new Date(r.date);
    const daysAgo = (now - d) / 86400000;

    // month-to-date
    if (d.getMonth() === month && d.getFullYear() === year) {
      totalThisMonth += Number(r.quantity || 0);
    }
    // rolling windows
    if (daysAgo <= 7) total7d += Number(r.quantity || 0);
    if (daysAgo <= 30) total30d += Number(r.quantity || 0);

    // by type
    typeTotals[r.type] = (typeTotals[r.type] || 0) + Number(r.quantity || 0);

    // latest sync
    if (!latestDate || d > latestDate) latestDate = d;
  });

  const avgPerDay30 = total30d / 30;
  const recyclableTypes = ["Plastic","Paper","Glass","Metal"];
  const recyclable = recyclableTypes.reduce((s,t)=> s + (typeTotals[t]||0), 0);
  const totalAll = Object.values(typeTotals).reduce((a,b)=>a+b,0);
  const recyclablePct = totalAll ? Math.round((recyclable / totalAll) * 100) : 0;

  const topType = Object.entries(typeTotals).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";

  return {
    totalThisMonth: totalThisMonth.toFixed(1),
    total7d: total7d.toFixed(1),
    avgPerDay30: avgPerDay30.toFixed(2),
    topType,
    recyclablePct,
    lastSynced: latestDate ? latestDate.toLocaleString() : "—",
  };
}, [records]);



//Bar
const barData = useMemo(() => {
  // group by month (YYYY-MM) and type
  const fmt = (d) => (d ? d.slice(0, 7) : ""); // "2025-10"
  const monthsSet = new Set();
  const byTypeMonth = {};

  records.forEach(r => {
    const m = fmt(r.date);
    if (!m) return;
    monthsSet.add(m);
    byTypeMonth[r.type] ??= {};
    byTypeMonth[r.type][m] = (byTypeMonth[r.type][m] || 0) + Number(r.quantity || 0);
  });

  const labels = Array.from(monthsSet).sort();

  const colorMap = {
    Organic: "#16a34a",
    Plastic: "#3b82f6",
    Paper:   "#facc15",
    Glass:   "#f87171",
    Metal:   "#a855f7",
    Other:   "#9ca3af",
  };

  const datasets = TYPES.map(type => ({
    label: type,
    data: labels.map(m => byTypeMonth[type]?.[m] || 0),
    backgroundColor: `${colorMap[type]}99`, // semi-opaque
    borderColor: colorMap[type],
    borderWidth: 1,
    stack: "waste", // all stacks together
  }));

  return { labels, datasets };
}, [records]);


const barOptions = React.useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: "#334155" } },
      title:  { display: true, text: "Monthly Waste by Type (Stacked)", color: "#0f172a" },
    },
    scales: {
      x: { stacked: true, ticks: { color: "#475569" }, grid: { color: "#e2e8f0" } },
      y: { stacked: true, ticks: { color: "#475569" }, grid: { color: "#e2e8f0" } },
    },
  }), []);
  




 const load = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("authToken");
    // console.log("[WasteDashboard] using BASE:", BASE);
    // console.log("[WasteDashboard] token present:", !!token);

    // if (!token) throw new Error("Not authenticated (missing token)");

    const res = await fetch(`${BASE}/records`, {
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type' on GET is optional; you can remove it if you like
        // "Content-Type": "application/json",
      },
    });


    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `${res.status} ${res.statusText}`);
    }

    const data = await WasteAPI.list(userId ? { residentId: userId } : {});
    setAllRecords(Array.isArray(data) ? data : []);
    setRecords(applyLocalFilters(Array.isArray(data) ? data : []));

    const c = await WasteAPI.credits(userId);
    setCredits(c.points ?? c ?? 0);

    // if (cr.ok) {
    //   const c = await cr.json();
    //   setCredits(c.points ?? c ?? 0);
    // } else {
    //   setCredits(calcLocalCredits(applyLocalFilters(data)));
    // }
  } catch (e) {
    console.error("Waste load error:", e.message || e);
    setAllRecords([]); setRecords([]); setCredits(0);
  } finally {
    setLoading(false);
  }
};



  // local credit calc fallback
  const FACTOR = { Plastic:10, Paper:6, Metal:12, Glass:8, Organic:0, Other:0 };
  const calcLocalCredits = (rows) =>
    rows.reduce((sum, r) => sum + Math.round((Number(r.quantity)||0) * (FACTOR[r.type] || 0)), 0);

  // re-apply UI filters without refetch
  const applyFilters = () => {
    setRecords(applyLocalFilters(allRecords));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { setRecords(applyLocalFilters(allRecords)); /* eslint-disable-next-line */ }, [filters, userId, allRecords]);



  const totalsByType = useMemo(() => {
    const map = Object.fromEntries(TYPES.map(t => [t, 0]));
    records.forEach(r => { map[r.type] = (map[r.type] || 0) + Number(r.quantity || 0); });
    return map;
  }, [records]);

  // Colored multi-series line (one per type)
  const lineData = useMemo(() => {
    const byType = {};
    records.forEach(r => {
      const d = r.date?.slice(0,10);
      byType[r.type] = byType[r.type] || {};
      byType[r.type][d] = (byType[r.type][d] || 0) + Number(r.quantity || 0);
    });

    const labels = Array.from(new Set(records.map(r => r.date?.slice(0,10)))).sort();

    const colorMap = {
      Organic: "#16a34a",
      Plastic: "#3b82f6",
      Paper: "#facc15",
      Glass: "#f87171",
      Metal: "#a855f7",
      Other: "#9ca3af",
    };

    const datasets = Object.keys(byType).map(type => ({
      label: type,
      data: labels.map(l => byType[type][l] || 0),
      borderColor: colorMap[type] || "#64748b",
      backgroundColor: `${colorMap[type] || "#64748b"}33`,
      pointBackgroundColor: colorMap[type] || "#64748b",
      pointBorderColor: "#fff",
      tension: 0.3,
      fill: true,
    }));

    return { labels, datasets };
  }, [records]);

  // Colored pie
  const pieData = useMemo(() => ({
    labels: Object.keys(totalsByType),
    datasets: [{
      data: Object.values(totalsByType),
      backgroundColor: [
        "#16a34a", // Organic
        "#3b82f6", // Plastic
        "#facc15", // Paper
        "#f87171", // Glass
        "#a855f7", // Metal
        "#9ca3af", // Other
      ],
      borderColor: "#fff",
      borderWidth: 2,
    }]
  }), [totalsByType]);

  const resetForm = () => { setForm({ date:"", type:"Plastic", quantity:"", unit:"kg", notes:"" }); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Not authenticated");
    if (!userId) return alert("Missing user id");

    const payload = {
      ...form,
      quantity: Number(form.quantity),
      unit: form.unit || "kg",
      source: "manual",
      residentId: userId,         // ensure record ties to current user
    };

    const url = editing ? `${BASE}/records/${editing}` : `${BASE}/records`;
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      return alert(t || `${res.status} ${res.statusText}`);
    }
    resetForm();
    await load();
  };

  const del = async (id) => {
    if (!token) return alert("Not authenticated");
    if (!confirm("Delete record?")) return;
    const res = await fetch(`${BASE}/records/${id}`, {
      method: "DELETE",
      headers: { Authorization:`Bearer ${token}` },
    });
    if (!res.ok) {
      const t = await res.text();
      return alert(t || `${res.status} ${res.statusText}`);
    }
    await load();
  };

  const toCSV = () => {
    const head = ["date","type","quantity","unit","notes"];
    const rows = records.map(r => head.map(h => r[h] ?? "").join(","));
    const csv = [head.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "waste-data.csv"; a.click();
  };

  // Exception flows
  if (!deviceLinked) {
    return (
      <div className="p-6">
        <div className="rounded-xl border p-6 bg-amber-50 border-amber-200">
          <h2 className="text-lg font-semibold mb-2">No linked device</h2>
          <p className="text-sm text-amber-800">
            (E2) You don’t have a smart bin linked. Please register a device to see real-time data.
          </p>
          <button className="mt-3 rounded-lg bg-emerald-600 text-white px-4 py-2">Register Device</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header cards */}
      {showHeaderCards && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Total Waste (kg) This Month">
            {records.reduce((s,r)=>
              s + (new Date(r.date).getMonth()===new Date().getMonth() ? Number(r.quantity||0) : 0),0).toFixed(1)}
          </Card>
          {showCredits && <Card title="Recycling Credits">{credits}</Card>}
          <Card title="Trend (7d)">
            {lineData.labels.length
              ? `${((lineData.datasets[0]?.data.at(-1) || 0) - (lineData.datasets[0]?.data[0] || 0)) >= 0 ? "↑" : "↓"}`
              : "—"}
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="rounded-xl border p-4 bg-white">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-slate-500">From</label>
              <input type="date" value={filters.from} onChange={e=>setFilters(f=>({...f,from:e.target.value}))}
                className="block rounded-lg border px-3 py-2"/>
            </div>
            <div>
              <label className="text-xs text-slate-500">To</label>
              <input type="date" value={filters.to} onChange={e=>setFilters(f=>({...f,to:e.target.value}))}
                className="block rounded-lg border px-3 py-2"/>
            </div>
            <div>
              <label className="text-xs text-slate-500">Type</label>
              <select value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}
                className="block rounded-lg border px-3 py-2">
                <option value="">All</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={applyFilters} className="shadow-lg rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600  text-white px-4 py-2 hover:shadow-xl">Apply</button>
            <button onClick={toCSV} className="shadow-lg rounded-lg border px-4 py-2 hover:bg-gradient-to-r from-emerald-500 to-teal-600">Download CSV</button>
            <button onClick={()=>window.print()} className="shadow-lg rounded-lg border px-4 py-2 hover:bg-gradient-to-r from-emerald-500 to-teal-600">Print/PDF</button>
          </div>
        </div>
      )}

      {/* Charts */}
      {showCharts && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4 bg-white lg:col-span-2">
            <h3 className="font-semibold mb-2">Waste Generation</h3>
            <Line data={lineData} />
          </div>
          <div className="rounded-xl border p-4 bg-white">
            <h3 className="font-semibold mb-2">Waste Categories</h3>
            <Pie data={pieData} />
          </div>
        </div>
      )}


      {showBar && (
        <div className="rounded-xl border p-4 bg-white">
          <div className="h-56"> {/* h-40 / h-56 / h-64 */}
            <Bar data={barData} options={{ ...barOptions, maintainAspectRatio: false }} />
          </div>
        </div>
      )}


      {/* Mini summary KPIs (Dashboard) */}
      {showMiniSummary && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="MTD Total (kg)">{kpis.totalThisMonth}</Card>
          <Card title="Last 7 Days (kg)">{kpis.total7d}</Card>
          <Card title="Avg / Day (30d)">{kpis.avgPerDay30}</Card>
          <Card title="Top Category">{kpis.topType}</Card>

          <div className="rounded-xl border p-4 bg-white md:col-span-2">
            <div className="text-xs text-slate-500">Recyclables %</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${kpis.recyclablePct}%` }} />
              </div>
              <div className="text-sm font-semibold w-10 text-right">{kpis.recyclablePct}%</div>
            </div>
            <div className="mt-2 text-xs text-slate-500">Last synced: {kpis.lastSynced}</div>
          </div>

          {/* Recent list you already have */}
          <div className="rounded-xl border p-4 bg-white md:col-span-2">
            <h3 className="font-semibold mb-3">Recent Waste Records</h3>
            <ul className="divide-y">
              {records.slice(0, 5).map((r) => (
                <li key={r.id || r._id} className="py-2 flex items-center justify-between">
                  <div className="text-sm">{r.type} — {r.quantity}{r.unit}</div>
                  <div className="text-xs text-slate-500">{(r.date||"").slice(0,10)}</div>
                </li>
              ))}
              {!records.length && <li className="py-4 text-slate-500 text-sm">No recent data.</li>}
            </ul>
          </div>
        </div>
      )}


      {/* Dashboard summary list (no CRUD) */}
      {showSummaryList && (
        <div className="rounded-xl border p-4 bg-white">
          <h3 className="font-semibold mb-3">Recent Waste Records</h3>
          <ul className="divide-y">
            {records.slice(0, summaryCount).map((r) => (
              <li key={r.id || r._id} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div>
                    <div className="text-sm font-medium">{r.type} — {r.quantity}{r.unit}</div>
                    <div className="text-xs text-slate-500">{(r.date || "").slice(0,10)} · {r.source || "manual"}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{r.notes || ""}</span>
              </li>
            ))}
            {!records.length && <li className="py-4 text-slate-500 text-sm">No recent data.</li>}
          </ul>
        </div>
      )}

      {/* Full CRUD area (History page) */}
      {!showSummaryList && (
        <div className="grid lg:grid-cols-3 gap-4">
          {showForm && (
            <div className="rounded-xl border p-4 bg-white">
              <h3 className="font-semibold mb-3">{editing ? "Edit Record" : "Add Record"}</h3>
              <form className="space-y-3" onSubmit={submit}>
                <input type="date" required value={form.date}
                  onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                  className="w-full rounded-lg border px-3 py-2"/>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                  className="w-full rounded-lg border px-3 py-2">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex gap-2">
                  <input type="number" min="0" step="0.1" required placeholder="Quantity"
                    value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}
                    className="flex-1 rounded-lg border px-3 py-2"/>
                  <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}
                    className="w-28 rounded-lg border px-3 py-2"><option>kg</option><option>L</option></select>
                </div>
                <input placeholder="Notes (optional)" value={form.notes}
                  onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  className="w-full rounded-lg border px-3 py-2"/>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2">{editing ? "Update" : "Create"}</button>
                  {editing && <button type="button" onClick={()=>setEditing(null)} className="rounded-lg border px-4 py-2">Cancel</button>}
                </div>
              </form>
            </div>
          )}

          {showTable && (
            <div className={`${showForm ? "lg:col-span-2" : "lg:col-span-3"} rounded-xl border p-4 bg-white overflow-auto`}>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Qty</th>
                    <th className="text-left px-3 py-2">Unit</th>
                    <th className="text-left px-3 py-2">Source</th>
                    <th className="text-left px-3 py-2">Notes</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!records.length && (
                    <tr>
                      <td colSpan="7" className="px-3 py-8 text-center text-slate-500">
                        (E1) No new data. Last synced: {new Date().toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {records.map(r => (
                    <tr key={r.id || r._id} className="border-t">
                      <td className="px-3 py-2">{r.date?.slice(0,10)}</td>
                      <td className="px-3 py-2">{r.type}</td>
                      <td className="px-3 py-2">{r.quantity}</td>
                      <td className="px-3 py-2">{r.unit}</td>
                      <td className="px-3 py-2">{r.source}</td>
                      <td className="px-3 py-2">{r.notes}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button className="rounded-md bg-emerald-500 text-white px-3 py-1"
                            onClick={()=>{ setEditing(r.id || r._id); setForm({ date:r.date?.slice(0,10), type:r.type, quantity:r.quantity, unit:r.unit, notes:r.notes||"" }); }}>
                            Edit
                          </button>
                          <button className="rounded-md bg-rose-600 text-white px-3 py-1"
                            onClick={()=>del(r.id || r._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border p-4 bg-white">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{children}</div>
    </div>
  );
}
