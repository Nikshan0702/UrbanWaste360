import React, { useEffect, useState } from "react";
import axios from "axios";

const CollectionSuccess = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/collection-records");
        setRecords(response.data);
      } catch (err) {
        console.error("Error fetching records:", err);
        setError("Failed to fetch collection records.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "collected":
        return (
          <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full border border-green-300">
            Collected
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full border border-yellow-300">
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full border border-red-300">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-poppins">
      <h2 className="text-3xl font-semibold text-green-700 mb-6 flex items-center gap-2">
        🗑️ Collection Records
      </h2>

      {loading && <p className="text-gray-600 animate-pulse">Loading records...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && records.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p className="text-5xl mb-3">🗂️</p>
          <p>No collection records available yet.</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200 transition-all">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-green-700 text-white uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Bin ID</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Weight (kg)</th>
                <th className="px-6 py-3 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record, index) => (
                <tr
                  key={record.id || `${record.binId}-${record.timestamp}`}
                  className="hover:bg-green-50 transition"
                >
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4">{record.binId}</td>
                  <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                  <td className="px-6 py-4">{record.weight}</td>
                  <td className="px-6 py-4">
                    {new Date(record.timestamp).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CollectionSuccess;
