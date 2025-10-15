import React, { useState, useEffect } from "react";
import axios from "axios";

const zones = [
  "Colombo 01","Colombo 02","Colombo 03","Colombo 04","Colombo 05",
  "Colombo 06","Colombo 07","Colombo 08","Colombo 09","Colombo 10",
  "Colombo 11","Colombo 12","Colombo 13","Colombo 14"
];

const wasteTypes = ["Plastic", "Organic", "Metal", "Paper", "Glass"];

export default function NearbyBinsWithCollection() {
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBin, setSelectedBin] = useState(null);
  const [wasteType, setWasteType] = useState("");
  const [weight, setWeight] = useState("");
  const [time, setTime] = useState(new Date().toISOString().slice(0, 16));
  const [successRecord, setSuccessRecord] = useState(null);

  useEffect(() => { fetchBins(); }, []);

  const fetchBins = async () => {
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

  const filterBins = (zone, search) => {
    const filtered = bins.filter(bin =>
      (zone === "" ||
        bin.location.replace(/\s+/g, "").toLowerCase()
          .includes(zone.replace(/\s+/g, "").toLowerCase())) &&
      bin.binId.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredBins(filtered);
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    filterBins(zone, searchTerm);
  };

  const handleAllClick = () => {
    setSelectedZone("");
    filterBins("", searchTerm);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterBins(selectedZone, value);
  };

  const handleBinClick = (bin) => {
    setSelectedBin(bin);
    setWasteType("");
    setWeight("");
    setTime(new Date().toISOString().slice(0, 16));
    setSuccessRecord(null);
  };

  const handleSubmit = async () => {
    if (!wasteType || !weight) return alert("Please fill all fields");
    try {
      const record = {
        binId: selectedBin.binId,
        collectorId: "COL001",
        status: "Collected",
        remarks: "",
        wasteType,
        weight: parseFloat(weight),
        timestamp: new Date(time)
      };
      await axios.post("http://localhost:8089/api/collection/record", record);
      setSuccessRecord(record);
      setSelectedBin(null);
    } catch (err) {
      console.error(err);
      alert("Failed to record collection");
    }
  };

  return (
    <div className="p-6 font-poppins bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold text-green-700 mb-6">🗑️ Nearby Bins</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Bin ID or scan QR..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full max-w-md mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {/* Zone buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {zones.map(zone => (
          <button
            key={zone}
            onClick={() => handleZoneClick(zone)}
            className={`px-4 py-2 rounded-full border transition ${
              selectedZone === zone
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-green-100"
            }`}
          >
            {zone}
          </button>
        ))}
        <button
          onClick={handleAllClick}
          className={`px-4 py-2 rounded-full border transition ${
            selectedZone === ""
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-green-100"
          }`}
        >
          All
        </button>
      </div>

      {/* Status messages */}
      {loading && <p className="text-gray-500">Loading bins...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && filteredBins.length === 0 && <p className="text-gray-500">No bins found.</p>}

      {/* Table */}
      {!loading && filteredBins.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 mb-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="p-3 border">Bin ID</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Location</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBins.map((bin, index) => (
                <tr
                  key={index}
                  className="odd:bg-gray-50 even:bg-white hover:bg-green-50 transition"
                >
                  <td className="p-3 border">{bin.binId}</td>
                  <td className="p-3 border text-gray-700">{bin.status}</td>
                  <td className="p-3 border text-gray-600">{bin.location}</td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleBinClick(bin)}
                      className="bg-emerald-500 text-white px-4 py-1.5 rounded hover:bg-emerald-600 transition"
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

      {/* Collection Form */}
      {selectedBin && (
        <div className="max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4 text-green-600">
            Collect Waste — {selectedBin.binId}
          </h3>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Waste Type</label>
            <select
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select</option>
              {wasteTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Submit
            </button>
            <button
              onClick={() => setSelectedBin(null)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successRecord && (
        <div className="max-w-md p-6 border border-green-400 bg-green-50 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            ✅ Collection Successful!
          </h3>
          <p><strong>Bin ID:</strong> {successRecord.binId}</p>
          <p><strong>Waste Type:</strong> {successRecord.wasteType}</p>
          <p><strong>Weight:</strong> {successRecord.weight} kg</p>
          <p><strong>Time:</strong> {new Date(successRecord.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
