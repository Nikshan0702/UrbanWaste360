import React, { useEffect, useMemo, useState } from "react";
import {
  FaTruck,
  FaMapMarkedAlt,
  FaTasks,
  FaWallet,
  FaHistory,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSync,
  FaRoute,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaPhone,
  FaCalendarAlt,
  FaQrcode,
  FaDirections,
  FaDownload,
} from "react-icons/fa";

// --- Config -------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || ""; // "" means use /api via proxy

const ENDPOINTS = {
  profile: () => `${API_BASE}/api/collectors/profile`,
  jobs: {
    list: (status) =>
      `${API_BASE}/api/collectors/jobs${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    accept: (jobId) => `${API_BASE}/api/collectors/jobs/${jobId}/accept`,
    start: (jobId) => `${API_BASE}/api/collectors/jobs/${jobId}/start`,
    pickup: (jobId) => `${API_BASE}/api/collectors/jobs/${jobId}/picked-up`,
    complete: (jobId) => `${API_BASE}/api/collectors/jobs/${jobId}/complete`,
    issue: (jobId) => `${API_BASE}/api/collectors/jobs/${jobId}/issue`,
  },
  payments: {
    wallet: (collectorId) => `${API_BASE}/api/payments/wallet/${collectorId}`,
    history: (collectorId) => `${API_BASE}/api/payments/history/${collectorId}`,
    payout: (collectorId) => `${API_BASE}/api/payments/collector/${collectorId}/payout`,
  },
  notifications: () => `${API_BASE}/api/collectors/notifications`,
};

// --- Utils --------------------------------------------------------
const currency = (v) => `LKR ${Number(v || 0).toFixed(2)}`;

const useAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  try {
    return await res.json();
  } catch {
    return null;
  }
};

// --- Small UI bits ------------------------------------------------
const Badge = ({ status }) => {
  const style = {
    pending: "text-yellow-700 bg-yellow-100",
    assigned: "text-blue-700 bg-blue-100",
    accepted: "text-indigo-700 bg-indigo-100",
    started: "text-teal-700 bg-teal-100",
    picked: "text-amber-700 bg-amber-100",
    completed: "text-green-700 bg-green-100",
    failed: "text-red-700 bg-red-100",
  };
  const mapIcon = {
    pending: <FaClock className="w-3 h-3 mr-1" />,
    assigned: <FaTasks className="w-3 h-3 mr-1" />,
    accepted: <FaCheckCircle className="w-3 h-3 mr-1" />,
    started: <FaRoute className="w-3 h-3 mr-1" />,
    picked: <FaQrcode className="w-3 h-3 mr-1" />,
    completed: <FaCheckCircle className="w-3 h-3 mr-1" />,
    failed: <FaTimesCircle className="w-3 h-3 mr-1" />,
  };
  const cls = style[status] || style.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {mapIcon[status]}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const InfoTile = ({ title, value, icon: Icon, sub }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className="text-4xl text-emerald-500/80">
        <Icon />
      </div>
    </div>
  </div>
);

const TopBar = ({ user, onLogout }) => (
  <header className="bg-white shadow-lg border-b">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">🚛</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">UrbanWaste360 · Collector</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 font-medium">
          {user ? `On duty, ${user.name}` : "Using stored data"}
        </span>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <FaSignOutAlt className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  </header>
);

const Sidebar = ({ active, setActive }) => {
  const items = [
    { id: "overview", label: "Overview", icon: FaTruck },
    { id: "jobs", label: "Jobs", icon: FaTasks },
    { id: "map", label: "Map", icon: FaMapMarkedAlt },
    { id: "earnings", label: "Earnings", icon: FaWallet },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "profile", label: "Profile", icon: FaUser },
  ];
  return (
    <div className="lg:w-64 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
      <nav className="space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          const activeCls =
            active === it.id
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "text-gray-700 hover:bg-gray-100 hover:shadow-md";
          return (
            <button
              key={it.id}
              onClick={() => setActive(it.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center ${activeCls}`}
            >
              <Icon className="mr-3 text-lg" />
              <span className="font-medium">{it.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const JobCard = ({ job, onAction, compact = false }) => {
  const actions = useMemo(() => {
    switch (job.status) {
      case "assigned":
        return [
          { id: "accept", label: "Accept", icon: FaCheckCircle, variant: "primary" },
          { id: "issue", label: "Report Issue", icon: FaExclamationTriangle, variant: "ghost" },
        ];
      case "accepted":
        return [
          { id: "start", label: "Start Route", icon: FaRoute, variant: "primary" },
          { id: "issue", label: "Report Issue", icon: FaExclamationTriangle, variant: "ghost" },
        ];
      case "started":
        return [
          { id: "pickup", label: "Confirm Pickup", icon: FaQrcode, variant: "primary" },
          { id: "issue", label: "Report Issue", icon: FaExclamationTriangle, variant: "ghost" },
        ];
      case "picked":
        return [
          { id: "complete", label: "Mark Complete", icon: FaCheckCircle, variant: "primary" },
          { id: "issue", label: "Report Issue", icon: FaExclamationTriangle, variant: "ghost" },
        ];
      default:
        return [];
    }
  }, [job.status]);

  return (
    <div className={`border border-gray-200 rounded-xl p-4 ${compact ? "" : "hover:bg-gray-50"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{job.customerName || job.title}</h4>
            <Badge status={job.status} />
          </div>
          <p className="text-sm text-gray-600">{job.address}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <FaCalendarAlt /> {job.scheduledAt ? new Date(job.scheduledAt).toLocaleString() : "—"}
          </p>
          {job.phone && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <FaPhone /> {job.phone}
            </p>
          )}
          {job.notes && <p className="text-xs text-gray-500 mt-2">Notes: {job.notes}</p>}
        </div>
        <div className="text-right min-w-[120px]">
          <p className="text-sm text-gray-500">Est. Earnings</p>
          <p className="font-bold">{currency(job.estimatedEarnings || 0)}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-end">
            {actions.map((a) => {
              const Icon = a.icon;
              const cls =
                a.variant === "primary"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-white hover:bg-gray-100 text-gray-700 border";
              return (
                <button
                  key={a.id}
                  onClick={() => onAction(a.id, job)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors border-emerald-200 ${cls} flex items-center gap-2`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ----------------------------------------------
const CollectorDashboard = () => {
  const headers = useAuthHeaders();

  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [collectorId, setCollectorId] = useState(null);

  const [wallet, setWallet] = useState(0);
  const [history, setHistory] = useState([]);

  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState("assigned");
  const [search, setSearch] = useState("");

  const [notifs, setNotifs] = useState([]);

  // bootstrap profile (once)
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const cached = localStorage.getItem("userData");
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setCollectorId(parsed.id || parsed.email);
        } else {
          const data = await fetchJSON(ENDPOINTS.profile(), { headers });
          setUser(data);
          setCollectorId(data?.id || data?.email);
          if (data) localStorage.setItem("userData", JSON.stringify(data));
        }
      } catch (e) {
        console.error("Profile load error", e);
        setError(`Failed to load profile. ${e?.message || ""}`);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load data when we know collectorId
  useEffect(() => {
    if (!collectorId) return;
    (async () => {
      await Promise.all([refreshWallet(), refreshHistory(), refreshJobs(jobFilter), refreshNotifs()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectorId]);

  const refreshWallet = async () => {
    try {
      const d = await fetchJSON(ENDPOINTS.payments.wallet(collectorId), { headers });
      setWallet(d?.balance || 0);
    } catch (e) {
      console.warn("wallet error", e);
    }
  };

  const refreshHistory = async () => {
    try {
      const d = await fetchJSON(ENDPOINTS.payments.history(collectorId), { headers });
      setHistory(Array.isArray(d) ? d : []);
    } catch (e) {
      console.warn("history error", e);
    }
  };

  const refreshJobs = async (status) => {
    try {
      const d = await fetchJSON(ENDPOINTS.jobs.list(status === "all" ? "" : status), { headers });
      setJobs(Array.isArray(d) ? d : []);
    } catch (e) {
      console.warn("jobs error", e);
    }
  };

  const refreshNotifs = async () => {
    try {
      const d = await fetchJSON(ENDPOINTS.notifications(), { headers });
      setNotifs(Array.isArray(d) ? d : []);
    } catch (e) {
      console.warn("notifs error", e);
    }
  };

  const onLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const doJobAction = async (action, job) => {
    // optimistic UI
    const prev = [...jobs];
    const idx = jobs.findIndex((j) => j.id === job.id);
    if (idx < 0) return;

    const nextStatusMap = { accept: "accepted", start: "started", pickup: "picked", complete: "completed" };
    const nextStatus = nextStatusMap[action];

    if (nextStatus) {
      const updated = [...jobs];
      updated[idx] = { ...job, status: nextStatus };
      setJobs(updated);
    }

    try {
      const urls = {
        accept: ENDPOINTS.jobs.accept(job.id),
        start: ENDPOINTS.jobs.start(job.id),
        pickup: ENDPOINTS.jobs.pickup(job.id),
        complete: ENDPOINTS.jobs.complete(job.id),
        issue: ENDPOINTS.jobs.issue(job.id),
      };
      const body = action === "issue" ? JSON.stringify({ message: "Collector reported an issue" }) : undefined;
      await fetchJSON(urls[action], { method: "POST", headers, body });

      if (action === "complete") {
        await Promise.all([refreshWallet(), refreshHistory()]);
      }
    } catch (e) {
      // rollback on error
      console.error("job action error", e);
      setJobs(prev);
      alert(`Failed to perform action: ${e?.message || "Unknown error"}`);
    }
  };

  const payout = async () => {
    const amountStr = prompt("Enter payout amount (LKR):", "");
    const amount = parseFloat(amountStr || "0");
    if (!amount || amount <= 0) return;
    if (amount > wallet) {
      alert("Amount exceeds wallet balance.");
      return;
    }
    try {
      await fetchJSON(ENDPOINTS.payments.payout(collectorId), {
        method: "POST",
        headers,
        body: JSON.stringify({ amount }),
      });
      alert("Payout request submitted.");
      await Promise.all([refreshWallet(), refreshHistory()]);
    } catch (e) {
      alert(`Payout failed: ${e?.message || "Unknown error"}`);
    }
  };

  const filteredJobs = useMemo(() => {
    const term = (search || "").toLowerCase();
    return jobs.filter((j) =>
      [j.customerName, j.title, j.address].filter(Boolean).some((x) => String(x).toLowerCase().includes(term))
    );
  }, [jobs, search]);

  // --- Subviews ---------------------------------------------------
  const Overview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoTile title="Wallet Balance" value={currency(wallet)} icon={FaWallet} sub="Available now" />
        <InfoTile
          title="Completed Jobs"
          value={jobs.filter((j) => j.status === "completed").length}
          icon={FaCheckCircle}
          sub="Lifetime"
        />
        <InfoTile
          title="Today’s Assignments"
          value={jobs.filter((j) => ["assigned", "accepted", "started", "picked"].includes(j.status)).length}
          icon={FaTasks}
          sub={new Date().toLocaleDateString()}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaTasks className="text-emerald-600" />
            Recent Jobs
          </h3>
          <button
            onClick={() => refreshJobs(jobFilter)}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            <FaSync className="w-4 h-4" /> Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.slice(0, 6).map((j) => (
            <JobCard key={j.id} job={j} onAction={doJobAction} />
          ))}
          {filteredJobs.length === 0 && <div className="text-center text-gray-500 py-8">No jobs to show.</div>}
        </div>
      </div>
    </div>
  );

  const Jobs = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="pl-9 pr-3 py-2 border rounded-xl w-72 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Search jobs, address, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                className="pl-9 pr-8 py-2 border rounded-xl w-56 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={jobFilter}
                onChange={async (e) => {
                  const v = e.target.value;
                  setJobFilter(v);
                  await refreshJobs(v);
                }}
              >
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="started">Started</option>
                <option value="picked">Picked</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshJobs(jobFilter)}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
            >
              <FaSync className="w-4 h-4" /> Reload
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredJobs.map((j) => (
          <JobCard key={j.id} job={j} onAction={doJobAction} />
        ))}
        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center text-gray-500">
            No jobs found for the current filter.
          </div>
        )}
      </div>
    </div>
  );

  const MapPanel = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <FaMapMarkedAlt className="text-emerald-600" />
          Live Map
        </h3>
        <div className="h-[480px] w-full rounded-xl border bg-[linear-gradient(45deg,#f6f7f9,#eef2f7)] grid place-items-center">
          <div className="text-center">
            <p className="font-semibold text-gray-700">Map placeholder</p>
            <p className="text-sm text-gray-500">Plug in your preferred map SDK (Mapbox, Google Maps) here.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <button className="px-3 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2">
            <FaDirections /> Optimize Route
          </button>
          <button className="px-3 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2">
            <FaDownload /> Export GPX
          </button>
          <button className="px-3 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2">
            <FaQrcode /> Scan Pickup QR
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <FaHistory className="text-emerald-600" />
          Upcoming Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs
            .filter((j) => ["assigned", "accepted", "started", "picked"].includes(j.status))
            .slice(0, 6)
            .map((j) => (
              <JobCard key={j.id} job={j} onAction={doJobAction} compact />
            ))}
        </div>
      </div>
    </div>
  );

  const Earnings = () => {
    const income = history.filter((h) => h.type === "income").reduce((s, x) => s + (x.amount || 0), 0);
    const payouts = history.filter((h) => h.type === "payout").reduce((s, x) => s + (x.amount || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoTile title="Wallet" value={currency(wallet)} icon={FaWallet} />
          <InfoTile title="Total Income" value={currency(income)} icon={FaCheckCircle} />
          <InfoTile title="Payouts" value={currency(payouts)} icon={FaDownload} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaHistory className="text-emerald-600" />
              Payment History
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshHistory}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <FaSync className="w-4 h-4" /> Refresh
              </button>
              <button
                onClick={payout}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Request Payout
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {history.length === 0 && <div className="text-center text-gray-500 py-8">No history yet.</div>}
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{h.description || h.type}</p>
                  <p className="text-xs text-gray-500">
                    {h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${h.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {h.type === "income" ? "+" : "-"}
                    {currency(Math.abs(h.amount || 0))}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      (h.status || "completed").toLowerCase() === "completed"
                        ? "text-green-700 bg-green-100"
                        : "text-yellow-700 bg-yellow-100"
                    }`}
                  >
                    {h.status || "Completed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Notifications = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FaBell className="text-emerald-600" />
          Notifications
        </h3>
        <button
          onClick={refreshNotifs}
          className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
        >
          <FaSync className="w-4 h-4" /> Refresh
        </button>
      </div>
      <div className="space-y-3">
        {notifs.length === 0 && <div className="text-center text-gray-500 py-8">Nothing new right now.</div>}
        {notifs.map((n) => (
          <div key={n.id} className="p-4 border rounded-xl flex items-start gap-3">
            <div className="text-emerald-600 mt-0.5">
              <FaBell />
            </div>
            <div>
              <p className="font-semibold text-sm">{n.title || "System"}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Profile = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FaUser className="text-emerald-600" />
        Profile
      </h3>
      {!user ? (
        <div className="text-gray-500">No user data.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-semibold">{user.number || user.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vehicle</p>
            <p className="font-semibold">{user.vehicle || "TBD"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-semibold">{user.address || "Not provided"}</p>
          </div>
        </div>
      )}
    </div>
  );

  // --- Shell ------------------------------------------------------
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 grid place-items-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 grid place-items-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-md">
          <div className="text-center py-4">
            <div className="text-red-500 text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar active={active} setActive={setActive} />
          <div className="flex-1">
            {active === "overview" && <Overview />}
            {active === "jobs" && <Jobs />}
            {active === "map" && <MapPanel />}
            {active === "earnings" && <Earnings />}
            {active === "notifications" && <Notifications />}
            {active === "profile" && <Profile />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
