import React from "react";

import { useNavigate } from "react-router-dom";

const routes = [
  { id: "R001", time: "7.00AM", name: "Colombo 07 - Cinnamon Gardens" },
  { id: "R002", time: "7.00AM", name: "Kotte - Nugegoda" },
  { id: "R003", time: "7.00AM", name: "Dehiwala - Mount Lavinia" },
];

export default function RouteSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (routeName) => {
    navigate("/bins", { state: { selectedZone: routeName } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-green-50 p-6">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-emerald-600">♻️ Smart Waste</h1>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <span className="hover:text-slate-900">Home</span>
            <span className="text-emerald-600">Routes</span>
            <span className="hover:text-slate-900">Report</span>
            <span className="hover:text-slate-900">Scan</span>
            <span className="hover:text-slate-900">Contact</span>
          </nav>
          <div className="h-8 w-8 rounded-full bg-slate-200" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">
            Select a Route
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => handleSelect(route.name)}
                className="group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Circle Map Image */}
                <div className="relative mb-4 h-44 w-44 overflow-hidden rounded-full sm:h-52 sm:w-52">
                  <img
                    src="/Maps.jpeg"
                    alt="Route Map"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow">
                    {route.id}
                  </span>
                </div>

                {/* Route Details */}
                <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="-mt-px"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {route.time}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {route.id}
                    </span>
                  </div>

                  <div className="mb-1 text-left text-lg font-semibold leading-snug text-slate-800">
                    {route.name}
                  </div>

                  <span className="text-sm font-medium text-emerald-600 underline-offset-2 group-hover:underline">
                    Select Route
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10">
            <button
              onClick={() => navigate("/bins", { state: { selectedZone: "" } })}
              className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-emerald-100"
            >
              View All Zones
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
