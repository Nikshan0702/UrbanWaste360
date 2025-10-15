import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function BinListPage() {
  const { state } = useLocation();
  const zone = state?.selectedZone || "";
  const navigate = useNavigate();

  const [bins, setBins] = useState([]);
  const [search, setSearch] = useState(""); 

  useEffect(() => {
    axios.get("http://localhost:8080/api/bins").then((res) => setBins(res.data));
  }, []);

  const filteredBins = bins.filter(
    (bin) =>
      (zone === "" ||
        bin.location.replace(/\s+/g, "").toLowerCase().includes(zone.replace(/\s+/g, "").toLowerCase())) &&
      bin.binId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-green-50 font-poppins">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-emerald-600">♻️ Smart Waste</h1>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <span className="hover:text-slate-900 cursor-pointer">Home</span>
            <span className="text-emerald-600 cursor-pointer">Bins</span>
            <span className="hover:text-slate-900 cursor-pointer">Routes</span>
            <span className="hover:text-slate-900 cursor-pointer">Report</span>
          </nav>

          <div className="h-8 w-8 rounded-full bg-slate-200" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-10">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow hover:bg-emerald-600 transition"
          aria-label="Back"
          title="Back"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-slate-800 mb-2">
            🗑️ Bins in{" "}
            <span className="text-emerald-600">
              {zone || "All Zones"}
            </span>
          </h2>
          <p className="text-slate-500 text-sm">
            View and manage bin collection activities in this route.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="🔍 Search Bin ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Table or Empty State */}
        {filteredBins.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-lg">No bins found 🚫</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm text-slate-700">
              <thead className="bg-emerald-600 text-white text-left">
                <tr>
                  <th className="p-3">Bin ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBins.map((bin, i) => (
                  <tr
                    key={i}
                    className={`border-t hover:bg-emerald-50 transition ${
                      i % 2 === 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3 font-medium text-slate-800">{bin.binId}</td>
                    <td>
                      <span
                        className={`ml-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          bin.status.toLowerCase() === "full"
                            ? "bg-red-100 text-red-700"
                            : bin.status.toLowerCase() === "collected"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {bin.status}
                      </span>
                    </td>
                    <td className="p-3">{bin.location}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => navigate("/collection-form", { state: { bin } })}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-white text-sm font-medium shadow hover:bg-emerald-600 transition"
                      >
                        Collect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
