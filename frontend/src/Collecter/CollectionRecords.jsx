import React, { useState } from 'react';
import axios from 'axios';

const CollectionRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const apiUrl = 'http://localhost:8080/api/collection-records';

    const fetchAllRecords = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const response = await axios.get(apiUrl);
            setRecords(response.data);
        } catch (err) {
            setError('Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete function
    const deleteRecord = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await axios.delete(`${apiUrl}/${id}`);
            setMessage(`Record with ID ${id} deleted successfully.`);
            setRecords(records.filter(record => record.id !== id)); // remove locally
        } catch (err) {
            setError('Failed to delete record');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-4">Collection Records</h1>

            <div className="flex justify-center mb-4">
                <button 
                    onClick={fetchAllRecords} 
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                >
                    Fetch All Records
                </button>
            </div>

            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {message && <p className="text-center text-blue-600">{message}</p>}

            <table className="min-w-full bg-white border border-gray-300 shadow-md mt-6 rounded-lg">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Bin ID</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Collector ID</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Status</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Waste Type</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Weight</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Timestamp</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id} className="border-t hover:bg-blue-50">
                            <td className="px-4 py-2 text-gray-700">{record.binId}</td>
                            <td className="px-4 py-2 text-gray-700">{record.collectorId}</td>
                            <td className="px-4 py-2 text-gray-700">{record.status}</td>
                            <td className="px-4 py-2 text-gray-700">{record.wastetype}</td>
                            <td className="px-4 py-2 text-gray-700">{record.weight}</td>
                            <td className="px-4 py-2 text-gray-700">{new Date(record.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-2 text-center">
                                <button 
                                    onClick={() => deleteRecord(record.id)} 
                                    className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-300"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CollectionRecords;
