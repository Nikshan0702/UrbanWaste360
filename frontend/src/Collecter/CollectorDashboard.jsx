import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8089/api";

const zones = [
  "Colombo 01","Colombo 02","Colombo 03","Colombo 04","Colombo 05",
  "Colombo 06","Colombo 07","Colombo 08","Colombo 09","Colombo 10",
  "Colombo 11","Colombo 12","Colombo 13","Colombo 14"
];

export default function CollectorDashboard() {
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      const res = await axios.get(`${API_BASE}/bins`);
      setBins(res.data);
      setFilteredBins(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching bins. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    const filtered = bins.filter(bin =>
      bin.location.replace(/\s+/g, "").toLowerCase()
        .includes(zone.replace(/\s+/g, "").toLowerCase())
    );
    setFilteredBins(filtered);
  };

  const handleAllClick = () => {
    setSelectedZone("");
    setFilteredBins(bins);
  };

  const updateStatus = async (binId, status) => {
    try {
      const payload = { binId, status };
      await axios.post(`${API_BASE}/collection/record`, payload);
      setBins(bins.map(b => b.binId === binId ? { ...b, status } : b));
      setFilteredBins(filteredBins.map(b => b.binId === binId ? { ...b, status } : b));
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "collected": return "bg-green-100 text-green-800";
      case "missed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading bins...</div>;

  const totalBins = bins.length;
  const collected = bins.filter(b => b.status === "Collected").length;
  const pending = bins.filter(b => b.status === "Pending" || !b.status).length;
  const missed = bins.filter(b => b.status === "Missed").length;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-poppins">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Collector Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm">Total Bins</h2>
          <p className="text-2xl font-semibold text-gray-800">{totalBins}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-green-400">
          <h2 className="text-gray-500 text-sm">Collected</h2>
          <p className="text-2xl font-semibold text-green-600">{collected}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-sm">Pending</h2>
          <p className="text-2xl font-semibold text-yellow-600">{pending}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border-l-4 border-red-400">
          <h2 className="text-gray-500 text-sm">Missed</h2>
          <p className="text-2xl font-semibold text-red-600">{missed}</p>
        </div>
      </div>

      {/* Zone Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={handleAllClick}
          className={`px-4 py-2 rounded-full border transition-all ${
            selectedZone === ""
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-green-100"
          }`}
        >
          All
        </button>
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => handleZoneClick(zone)}
            className={`px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
              selectedZone === zone
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-green-100"
            }`}
          >
            {zone}
          </button>
        ))}
      </div>

      {filteredBins.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No bins in this zone.</p>
      ) : (
        <div className="space-y-4">
          {filteredBins.map(bin => (
            <div
              key={bin.id}
              className="flex justify-between items-center p-5 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {bin.binId} — <span className="text-gray-600">{bin.location}</span>
                </p>
                <p className="mt-1 text-sm">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bin.status || "Pending")}`}
                  >
                    {bin.status || "Pending"}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                {["Pending", "Collected", "Missed"].map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(bin.binId, status)}
                    disabled={bin.status === status || (!bin.status && status === "Pending")}
                    className={`px-3 py-1 rounded-md font-medium text-sm transition ${
                      bin.status === status || (!bin.status && status === "Pending")
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : status === "Collected"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
