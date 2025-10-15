import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const wasteTypes = ["Plastic", "Organic", "Metal", "Paper", "Glass"];

export default function CollectionFormPage() {
  const { state } = useLocation();
  const bin = state?.bin;
  const navigate = useNavigate();

  const routeName =
    state?.selectedZone ||
    state?.routeName ||
    state?.bin?.zone ||
    "Selected Route";

  const [wasteType, setWasteType] = useState("");
  const [weight, setWeight] = useState("");
  const [time, setTime] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = async () => {
    if (!wasteType || !weight) return alert("Please fill all fields");
    const record = {
      binId: bin.binId,
      collectorId: "COL001",
      status: "Collected",
      remarks: "",
      wasteType,
      weight: parseFloat(weight),
      timestamp: new Date(time),
    };

    await axios.post("http://localhost:8080/api/collection/record", record);
    navigate("/confirmation", { state: { record } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-green-50">

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Back Button */}
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

        {/* Title */}
        <h2 className="mb-8 text-center text-2xl font-semibold text-slate-800 sm:text-[26px]">
          Current Route –{" "}
          <span className="text-emerald-600">{routeName}</span>
        </h2>

        {/* Main Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_6px_20px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT: FORM */}
            <div className="flex flex-col justify-center">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Bin ID
                </label>
                <input
                  value={bin?.binId || ""}
                  readOnly
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Bin selected: {bin?.binId}
                </p>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Waste Type
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none"
                >
                  <option value="">Select</option>
                  {wasteTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Time
                </label>
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-white shadow hover:bg-emerald-700 transition"
                >
                  Submit
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 rounded-lg bg-emerald-100 px-4 py-2 text-slate-800 hover:bg-emerald-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* RIGHT: QR BLOCK */}
            <div className="relative flex flex-col items-center justify-center rounded-xl bg-slate-50 p-6">
              {/* Divider for small screens */}
              <div className="absolute top-0 left-0 right-0 md:hidden border-b border-slate-200 mb-4"></div>

              <div className="mb-5 grid h-32 w-32 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  width="60"
                  height="60"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-emerald-600"
                  fill="none"
                >
                  <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3z" />
                  <path d="M15 15h2v2h-2zM19 15h2v6h-6v-2h4z" />
                </svg>
              </div>

              <p className="mb-3 text-sm text-slate-500 text-center">
                Scan QR code to auto-fill bin data
              </p>

              <button
                type="button"
                // onClick={() => navigate("/scan")}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-white shadow hover:bg-emerald-700 transition"
              >
                Scan Bin
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
