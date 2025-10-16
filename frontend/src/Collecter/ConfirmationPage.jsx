import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function ConfirmationPage() {
  const { state } = useLocation();
  const record = state?.record;
  const navigate = useNavigate();

  if (!record)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg font-medium">No record found.</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full border border-blue-100">
        <div className="flex items-center justify-center mb-6">
          <CheckCircle2 className="text-blue-600 w-16 h-16" />
        </div>

        <h2 className="text-3xl font-semibold text-center text-blue-700 mb-2">
          Collection Successful!
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your waste collection record has been saved successfully.
        </p>

        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-y-3 text-gray-700 text-sm">
            <span className="font-semibold">Route:</span>
            <span>{record.zone}</span>

            <span className="font-semibold">Bin ID:</span>
            <span>{record.binId}</span>

            <span className="font-semibold">Waste Type:</span>
            <span>{record.wasteType}</span>

            <span className="font-semibold">Weight:</span>
            <span>{record.weight} kg</span>

            <span className="font-semibold">Time:</span>
            <span>{new Date(record.timestamp).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/CollecterDashBoard")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-300 ease-in-out shadow-md"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
