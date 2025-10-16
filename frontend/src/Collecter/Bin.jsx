import React, { useState, useEffect } from "react";
import axios from "axios";

function Bin() {
  const [bins, setBins] = useState([]);
  const [newBin, setNewBin] = useState({
    binId: "",
    location: "",
    status: "",
    assignedCollectorId: "COL001",
  });
  const [editBin, setEditBin] = useState(null);

  // Fetch all bins
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/bins")
      .then((response) => {
        setBins(response.data);
      })
      .catch((error) => {
        console.error("Error fetching bins", error);
      });
  }, []);

  // Create a new Bin
  const createBin = () => {
    axios
      .post("http://localhost:8080/api/v1/bins", newBin)
      .then((response) => {
        setBins([...bins, response.data]);
        setNewBin({
          binId: "",
          location: "",
          status: "",
          assignedCollectorId: "",
        });
      })
      .catch((error) => {
        console.error("Error creating bin", error);
      });
  };

  // Delete Bin
  const deleteBin = (id) => {
    axios
      .delete(`http://localhost:8080/api/v1/bins/${id}`)
      .then(() => {
        setBins(bins.filter((bin) => bin.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting bin", error);
      });
  };

  // Start editing Bin
  const startEditing = (bin) => {
    setEditBin(bin);
  };

  // Update Bin
  const updateBin = () => {
    axios
      .put(`http://localhost:8080/api/v1/bins/${editBin.id}`, editBin)
      .then((response) => {
        setBins(
          bins.map((bin) => (bin.id === editBin.id ? response.data : bin))
        );
        setEditBin(null); // Clear the edit state
      })
      .catch((error) => {
        console.error("Error updating bin", error);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Bin Management</h1>

      {/* Bin Creation Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Create Bin</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Bin ID"
            value={newBin.binId}
            onChange={(e) => setNewBin({ ...newBin, binId: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Location"
            value={newBin.location}
            onChange={(e) => setNewBin({ ...newBin, location: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Status"
            value={newBin.status}
            onChange={(e) => setNewBin({ ...newBin, status: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Assigned Collector ID"
            value={newBin.assignedCollectorId}
            onChange={(e) =>
              setNewBin({ ...newBin, assignedCollectorId: e.target.value })
            }
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={createBin}
            className="w-full p-2 bg-blue-500 text-white rounded-md mt-4 hover:bg-blue-600"
          >
            Create Bin
          </button>
        </div>
      </div>

      {/* Edit Bin Form */}
      {editBin && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Edit Bin</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={editBin.binId}
              onChange={(e) => setEditBin({ ...editBin, binId: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              value={editBin.location}
              onChange={(e) =>
                setEditBin({ ...editBin, location: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              value={editBin.status}
              onChange={(e) => setEditBin({ ...editBin, status: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              value={editBin.assignedCollectorId}
              onChange={(e) =>
                setEditBin({ ...editBin, assignedCollectorId: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            />
            <button
              onClick={updateBin}
              className="w-full p-2 bg-blue-500 text-white rounded-md mt-4 hover:bg-blue-600"
            >
              Update Bin
            </button>
            <button
              onClick={() => setEditBin(null)}
              className="w-full p-2 bg-gray-500 text-white rounded-md mt-4 hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bin List */}
      <h2 className="text-2xl font-semibold mb-4">All Bins</h2>
      <ul className="space-y-4">
        {bins.map((bin) => (
          <li key={bin.id} className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-lg font-semibold">Bin ID: {bin.binId}</p>
            <p>Location: {bin.location}</p>
            <p>Status: {bin.status}</p>
            <p>Assigned Collector ID: {bin.assignedCollectorId}</p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => startEditing(bin)}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteBin(bin.id)}
                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Bin;
