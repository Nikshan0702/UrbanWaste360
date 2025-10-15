import React, { useState, useEffect } from "react";
import axios from "axios";

const zones = [
  "Colombo 01","Colombo 02","Colombo 03","Colombo 04","Colombo 05",
  "Colombo 06","Colombo 07","Colombo 08","Colombo 09","Colombo 10",
  "Colombo 11","Colombo 12","Colombo 13","Colombo 14"
];

const NearbyBins = () => {
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllBins = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8089/api/bins");
      setBins(res.data);
      setFilteredBins(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching bins:", err);
      setError("Failed to fetch bins. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBins();
  }, []);

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    const filtered = bins.filter(bin =>
      bin.location.replace(/\s+/g,'').toLowerCase()
        .includes(zone.replace(/\s+/g,'').toLowerCase()) &&
      bin.binId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBins(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = bins.filter(bin =>
      bin.binId.toLowerCase().includes(value.toLowerCase()) &&
      (selectedZone === "" || bin.location.replace(/\s+/g,'').toLowerCase()
        .includes(selectedZone.replace(/\s+/g,'').toLowerCase()))
    );
    setFilteredBins(filtered);
  };

  const handleAllClick = () => {
    setSelectedZone("");
    setFilteredBins(bins.filter(bin =>
      bin.binId.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()){
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "collected": return "bg-green-100 text-green-800";
      case "missed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nearby Bins</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by Bin ID or scan QR..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full max-w-md px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {/* Zone buttons */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => handleZoneClick(zone)}
            className={`px-4 py-2 rounded-md border ${
              selectedZone === zone ? "bg-green-500 text-white" : "bg-white text-gray-800 border-gray-300"
            } hover:bg-green-400 hover:text-white transition`}
          >
            {zone}
          </button>
        ))}
        <button
          onClick={handleAllClick}
          className={`px-4 py-2 rounded-md border ${
            selectedZone === "" ? "bg-green-500 text-white" : "bg-white text-gray-800 border-gray-300"
          } hover:bg-green-400 hover:text-white transition`}
        >
          All
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading bins...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && filteredBins.length === 0 && <p className="text-gray-500">No bins found.</p>}

      {/* Bin cards */}
      <div className="space-y-4">
        {filteredBins.map(bin => (
          <div key={bin.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition">
            <div>
              <p className="font-semibold text-gray-800">{bin.binId}</p>
              <p className="text-gray-600 text-sm">{bin.location}</p>
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

export default NearbyBins;
