import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

const CollectorFilterPage = () => {
  const [collectorId, setCollectorId] = useState("");
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!collectorId) return alert("Enter a Collector ID");

    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/collector/${collectorId}/bins`);
      setBins(res.data);
      if (res.data.length === 0) setError("No bins found for this collector");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bins. Make sure backend is running.");
      setBins([]);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Filter Bins by Collector ID</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter Collector ID"
          value={collectorId}
          onChange={e => setCollectorId(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleFetch}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Fetch Bins
        </button>
      </div>

      {loading && <p className="text-gray-600 mb-4">Loading bins...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {bins.map(bin => (
          <div key={bin.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition">
            <div>
              <p className="font-semibold text-gray-800">{bin.binId} — <span className="text-gray-600">{bin.location}</span></p>
            </div>
            <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(bin.status || "Pending")}`}>
              {bin.status || "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectorFilterPage;
