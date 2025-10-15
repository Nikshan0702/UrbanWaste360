import React, { useState } from 'react';
import axios from 'axios';

const CollectionRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiUrl = 'http://localhost:8080/api/collection-records'; // Change this to your Spring Boot API URL

    const fetchAllRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrl);
            setRecords(response.data);
        } catch (err) {
            setError('Failed to fetch records');
        } finally {
            setLoading(false);
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

            <table className="min-w-full bg-white border border-gray-300 shadow-md mt-6 rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">ID</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Bin ID</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Collector ID</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Status</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Waste Type</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Weight</th>
                        <th className="px-4 py-2 text-left text-gray-700 font-semibold">Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-700">{record.id}</td>
                            <td className="px-4 py-2 text-gray-700">{record.binId}</td>
                            <td className="px-4 py-2 text-gray-700">{record.collectorId}</td>
                            <td className="px-4 py-2 text-gray-700">{record.status}</td>
                            <td className="px-4 py-2 text-gray-700">{record.wastetype}</td>
                            <td className="px-4 py-2 text-gray-700">{record.weight}</td>
                            <td className="px-4 py-2 text-gray-700">{new Date(record.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CollectionRecords;
