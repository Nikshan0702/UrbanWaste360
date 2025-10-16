// src/payment/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  FaUsers, FaUser, FaSearch, FaWallet, FaHistory, FaRecycle, FaClock,
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaChartBar, FaChartPie,
  FaChartLine, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheck, FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const API = 'http://localhost:8080';
const isDevToken = (t) => !t || t === 'demo-token' || t === 'null' || t === 'undefined';

async function authFetch(path, { method = 'GET', body, headers = {}, json = true } = {}) {
  const token = localStorage.getItem('authToken');
  const finalHeaders = {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token && !isDevToken(token) ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  const res = await fetch(`${API}${path}`, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    ...(body ? { body: json ? JSON.stringify(body) : body } : {}),
  });
  return res;
}

/* ------------ UI helpers (must exist) ------------ */
const SectionCard = ({ title, icon, right, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {right}
    </div>
    {children}
  </div>
);

const KPI = ({ label, value, sub, tone = 'emerald' }) => {
  const colors = {
    emerald: 'text-emerald-700',
    indigo: 'text-indigo-700',
    blue: 'text-blue-700',
    gray: 'text-gray-900',
    red: 'text-rose-700',
  };
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-3xl font-bold ${colors[tone] || colors.gray}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
};

const Pill = ({ children, tone = 'yellow' }) => {
  const tones = {
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};
/* ------------------------------------------------ */

const AdminDashboard = () => {
  const [tab, setTab] = useState('analytics'); // default to analytics
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [uQuery, setUQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const [wallet, setWallet] = useState(0);
  const [history, setHistory] = useState([]);

  const [pending, setPending] = useState([]);
  const [collected, setCollected] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [updating, setUpdating] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ residentId:'', date:'', time:'', type:'Pickup', notes:'' });
  const [upcoming, setUpcoming] = useState([]);

  const [wasteRecords, setWasteRecords] = useState([]);
  const [globalByType, setGlobalByType] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [busy, setBusy] = useState(false);

  const logout = () => { localStorage.clear(); window.location.href = '/'; };

  /* --- Admin profile (fallback chain) --- */
  useEffect(() => {
    (async () => {
      try {
        let res = await authFetch('/api/users/my-profile');
        if (!res.ok) res = await authFetch('/api/users/profile');
        if (res.ok) setAdmin(await res.json());
      } catch {}
    })();
  }, []);

  /* --- Users (ADMIN required when security enabled) --- */
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/users');
        if (res.ok) {
          const list = await res.json();
          setUsers(list || []);
          if (list?.length) setSelectedUser(list[0]);
        } else {
          setUsers([]); // keep UI alive
        }
      } catch { setUsers([]); }
    })();
  }, []);

  /* --- Per-user finance --- */
  useEffect(() => {
    if (!selectedUser?.id) return;
    (async () => {
      try {
        const [w, h] = await Promise.all([
          authFetch(`/api/payments/wallet/${selectedUser.id}`),
          authFetch(`/api/payments/history/${selectedUser.id}`)
        ]);
        setWallet(w.ok ? (await w.json()).balance || 0 : 0);
        setHistory(h.ok ? await h.json() : []);
      } catch { setWallet(0); setHistory([]); }
    })();
  }, [selectedUser?.id]);

  /* --- Sell requests --- */
  const loadRequests = async () => {
    const get = async (s) => {
      try {
        const r = await authFetch(`/api/admin/sell-requests?status=${s}`);
        return r.ok ? await r.json() : [];
      } catch { return []; }
    };
    setPending(await get('PENDING'));
    setCollected(await get('COLLECTED'));
    setRejected(await get('REJECTED'));
  };
  useEffect(() => { loadRequests(); }, []);

  /* --- Admin waste records (selected user) --- */
  const loadWasteRecords = async (user) => {
    if (!user?.id) return;
    try {
      let res = await authFetch(`/api/admin/records/waste/by-resident?residentId=${encodeURIComponent(user.id)}`);
      setWasteRecords(res.ok ? await res.json() : []);
    } catch { setWasteRecords([]); }
  };
  useEffect(() => { loadWasteRecords(selectedUser); }, [selectedUser?.id]);

  /* --- Global agg by type --- */
  const loadGlobalByType = async () => {
    try {
      const res = await authFetch('/api/admin/records/waste/aggregate/by-type');
      setGlobalByType(res.ok ? await res.json() : []);
    } catch { setGlobalByType([]); }
  };

  /* --- Schedules --- */
  const loadUpcoming = async () => {
    try {
      const res = await authFetch('/api/admin/schedules?range=upcoming');
      setUpcoming(res.ok ? await res.json() : []);
    } catch { setUpcoming([]); }
  };
  useEffect(() => { loadUpcoming(); }, []);

  const assignSchedule = async () => {
    if (!scheduleForm.residentId || !scheduleForm.date || !scheduleForm.time) return alert('Resident, date & time required');
    try {
      setAssigning(true);
      const res = await authFetch('/api/admin/schedules', { method:'POST', body: scheduleForm });
      setAssigning(false);
      if (res.ok) { alert('Pickup scheduled'); setScheduleForm(s => ({...s, date:'', time:'', notes:''})); loadUpcoming(); }
      else alert(await res.text());
    } catch { setAssigning(false); alert('Failed to schedule'); }
  };

  /* --- Analytics --- */
  const computeClientAnalytics = () => {
    const totalRequests = pending.length + collected.length + rejected.length;
    const collectedKg = collected.reduce((s, r) => s + (r.collectedKg || r.quantityKg || 0), 0);
    return {
      totalUsers: users.length,
      totalRequests,
      collectedKg: Math.round(collectedKg),
      completionRate: totalRequests ? Math.round((collected.length / totalRequests) * 100) : 0
    };
  };
  const loadAnalytics = async () => {
    setBusy(true);
    try {
      const res = await authFetch('/api/admin/records/analytics');
      if (res.ok) setAnalytics(await res.json());
      else setAnalytics(computeClientAnalytics());
    } catch { setAnalytics(computeClientAnalytics()); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    loadGlobalByType();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length, pending.length, collected.length, rejected.length]);

  /* --- Derived chart data (selected user) --- */
  const wasteByType = useMemo(() => {
    const m = {};
    (wasteRecords || []).forEach(r => { m[r.type || 'Other'] = (m[r.type || 'Other'] || 0) + Number(r.quantity || 0); });
    return Object.entries(m).map(([name, kg]) => ({ name, kg: Number(kg.toFixed(2)) }));
  }, [wasteRecords]);

  const wasteByMonth = useMemo(() => {
    const m = {};
    (wasteRecords || []).forEach(r => {
      const d = r.createdAt || r.date;
      const dt = d ? new Date(d) : null;
      const key = dt ? `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}` : 'Unknown';
      m[key] = (m[key] || 0) + Number(r.quantity || 0);
    });
    return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])).map(([month, kg]) => ({ month, kg: Number(kg.toFixed(2)) }));
  }, [wasteRecords]);

  const filteredUsers = useMemo(() => {
    const s = uQuery.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      u =>
        (u.name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.id || '').toLowerCase().includes(s)
    );
  }, [users, uQuery]);

  /* ---- Reusable lists ---- */
  const RequestsList = ({ items, status, actions }) => {
    const tone = status === 'PENDING' ? 'yellow' : status === 'COLLECTED' ? 'green' : 'red';
    const Icon = status === 'PENDING' ? FaClock : status === 'COLLECTED' ? FaCheckCircle : FaTimesCircle;
    return (
      <SectionCard
        title={`${status.charAt(0)}${status.slice(1).toLowerCase()} Requests`}
        icon={<Icon />}
        right={<button onClick={loadRequests} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Refresh</button>}
      >
        <div className="space-y-3">
          {items.map(r => (
            <div key={r.id} className="p-3 rounded-lg border bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{r.type} • {Number(r.quantityKg).toFixed(2)} kg</div>
                  <div className="text-gray-600">Resident: {r.residentId}</div>
                  <div className="mt-1"><Pill tone={tone}>{status}</Pill></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">LKR {r.unitPriceLkr}/kg</div>
                  {status === 'COLLECTED' && (
                    <div className="text-emerald-700 font-semibold">Credited: LKR {Number(r.creditedAmount || 0).toFixed(2)}</div>
                  )}
                  {actions && status === 'PENDING' && (
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => {
                          const payload = { status:'COLLECTED' };
                          const kg = prompt('Collected kg (leave blank to use requested qty):');
                          if (kg) payload.collectedKg = parseFloat(kg);
                          (async ()=>{
                            setUpdating(true);
                            const res = await authFetch(`/api/admin/sell-requests/${r.id}/status`, { method:'POST', body: payload });
                            setUpdating(false);
                            if (!res.ok) alert(await res.text());
                            await loadRequests();
                          })();
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs disabled:opacity-60"
                        disabled={updating}
                      >
                        <FaCheck className="inline mr-1" /> Collected
                      </button>
                      <button
                        onClick={() => (async ()=>{
                          setUpdating(true);
                          const res = await authFetch(`/api/admin/sell-requests/${r.id}/status`, { method:'POST', body:{ status:'REJECTED' } });
                          setUpdating(false);
                          if (!res.ok) alert(await res.text());
                          await loadRequests();
                        })()}
                        className="px-3 py-1 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-xs disabled:opacity-60"
                        disabled={updating}
                      >
                        <FaTimes className="inline mr-1" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-500">No items.</div>}
        </div>
      </SectionCard>
    );
  };

  /* ---- Tabs ---- */

  const UsersTab = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users list */}
      <div className="lg:col-span-1">
        <SectionCard title="Users" icon={<FaUsers />}>
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Search by name, email, id"
              value={uQuery}
              onChange={(e) => setUQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredUsers.map(u => (
              <button key={u.id}
                onClick={() => { setSelectedUser(u); setTab('users'); }}
                className={`w-full text-left p-3 rounded-xl border transition ${selectedUser?.id === u.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                    <FaUser />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{u.name || 'Unnamed'}</div>
                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                  </div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && <div className="text-sm text-gray-500 text-center py-6">No users found.</div>}
          </div>
        </SectionCard>
      </div>

      {/* User details + KPIs */}
      <div className="lg:col-span-2 space-y-6">
        <SectionCard
          title="User Profile"
          icon={<FaUser />}
          right={
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <KPI label="Wallet" value={`LKR ${wallet.toFixed(2)}`} tone="emerald" />
              <KPI label="Income" value={`LKR ${history.filter(h=>h.type==='income').reduce((s,x)=>s+(x.amount||0),0).toFixed(2)}`} tone="blue" />
              <KPI label="Payments" value={`LKR ${history.filter(h=>h.type==='payment').reduce((s,x)=>s+(x.amount||0),0).toFixed(2)}`} tone="indigo" />
            </div>
          }
        >
          {selectedUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-sm text-gray-600 mb-1">Name</div><div className="font-semibold">{selectedUser.name || '—'}</div></div>
              <div><div className="text-sm text-gray-600 mb-1">Email</div><div className="font-semibold flex items-center gap-2"><FaEnvelope className="text-gray-400" /> {selectedUser.email || '—'}</div></div>
              <div><div className="text-sm text-gray-600 mb-1">Phone</div><div className="font-semibold flex items-center gap-2"><FaPhone className="text-gray-400" /> {selectedUser.number || selectedUser.phone || '—'}</div></div>
              <div><div className="text-sm text-gray-600 mb-1">Address</div><div className="font-semibold flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> {selectedUser.address || '—'}</div></div>
              <div><div className="text-sm text-gray-600 mb-1">Role</div><div className="font-semibold">{selectedUser.role || 'USER'}</div></div>
              <div><div className="text-sm text-gray-600 mb-1">User ID</div><div className="font-semibold">{selectedUser.id || '—'}</div></div>
            </div>
          ) : <div className="text-sm text-gray-500">Select a user from the list.</div>}
        </SectionCard>

        {/* Per-user charts */}
        <SectionCard title="User Waste by Type (kg)" icon={<FaChartBar />}>
          <div className="h-72">
            {wasteByType.length === 0 ? <div className="text-sm text-gray-500">No data.</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteByType} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kg" name="Kilograms" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard title="User Waste by Month (kg)" icon={<FaChartLine />}>
          <div className="h-72">
            {wasteByMonth.length === 0 ? <div className="text-sm text-gray-500">No data.</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wasteByMonth} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kg" name="Kilograms" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Payment History" icon={<FaHistory />} right={
          <button onClick={async () => {
            const res = await authFetch(`/api/payments/history/${selectedUser?.id}`);
            if (res.ok) setHistory(await res.json());
          }} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Refresh</button>
        }>
          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-sm text-gray-500">No transactions yet.</div>
            ) : history.map(p => {
              const status = (p.status || '').toUpperCase();
              const tone = status === 'COMPLETED' ? 'green' : status === 'FAILED' ? 'red' : 'yellow';
              const typeTone = p.type === 'income' ? 'text-green-600' : 'text-rose-600';
              return (
                <div key={p.id} className="p-3 rounded-lg border bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{p.paymentMethod || '—'}</div>
                      <div className="text-xs text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                      {p.description && <div className="text-xs text-gray-600 mt-1">{p.description}</div>}
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${typeTone}`}>
                        {p.type === 'income' ? '+' : '-'} LKR {Number(p.amount || 0).toFixed(2)}
                      </div>
                      <div className="mt-1"><Pill tone={tone}>{status || 'PENDING'}</Pill></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const RequestsTab = (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <RequestsList items={pending} status="PENDING" actions />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestsList items={collected} status="COLLECTED" />
          <RequestsList items={rejected} status="REJECTED" />
        </div>
      </div>
      <div className="space-y-6">
        <SectionCard title="Snapshot" icon={<FaRecycle />} right={
          <button onClick={loadRequests} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Refresh</button>
        }>
          <div className="grid grid-cols-3 gap-3">
            <KPI label="Pending" value={pending.length} tone="gray" />
            <KPI label="Collected" value={collected.length} tone="emerald" />
            <KPI label="Rejected" value={rejected.length} tone="red" />
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const ScheduleTab = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SectionCard title="Assign Collection Schedule" icon={<FaCalendarAlt />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Resident</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                value={scheduleForm.residentId}
                onChange={(e) => setScheduleForm(f => ({ ...f, residentId: e.target.value }))}
              >
                <option value="">Select resident</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email} ({u.id?.slice(0,6)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                value={scheduleForm.type}
                onChange={(e) => setScheduleForm(f => ({ ...f, type: e.target.value }))}
              >
                <option>Pickup</option>
                <option>Bulky Pickup</option>
                <option>Recycling Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input type="date"
                     className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                     value={scheduleForm.date}
                     onChange={(e) => setScheduleForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time</label>
              <input type="time"
                     className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                     value={scheduleForm.time}
                     onChange={(e) => setScheduleForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Optional notes…"
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <button onClick={assignSchedule}
                    disabled={assigning}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold">
              {assigning ? 'Assigning…' : 'Assign Pickup'}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Schedules" icon={<FaCalendarAlt />} right={
          <button onClick={loadUpcoming} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Refresh</button>
        }>
          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {upcoming.length === 0 ? (
              <div className="text-sm text-gray-500">No upcoming pickups scheduled.</div>
            ) : upcoming.map(s => (
              <div key={s.id} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">{s.type}</div>
                    <div className="text-gray-600">Resident: {s.residentId}</div>
                    {s.notes && <div className="text-gray-500 text-xs mt-1">{s.notes}</div>}
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">{s.date} • {s.time}</div>
                    <Pill tone="blue">Scheduled</Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Side KPIs */}
      <div className="space-y-6">
        <SectionCard title="Quick KPIs" icon={<FaChartBar />}>
          <div className="grid grid-cols-2 gap-3">
            <KPI label="Users" value={users.length} />
            <KPI label="Pending" value={pending.length} />
            <KPI label="Collected" value={collected.length} tone="emerald" />
            <KPI label="Rejected" value={rejected.length} tone="red" />
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const AnalyticsTab = (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <SectionCard title="System Overview" icon={<FaChartPie />} right={
          <button onClick={loadAnalytics} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
        }>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI label="Total Users" value={analytics?.totalUsers ?? users.length} />
            <KPI label="Total Records" value={analytics?.totalRequests ?? (pending.length+collected.length+rejected.length)} />
            <KPI label="Collected (kg)" value={analytics?.collectedKg ?? 0} tone="emerald" />
            <KPI label="Completion Rate" value={`${analytics?.completionRate ?? 0}%`} tone="indigo" />
          </div>
        </SectionCard>

        <SectionCard title="All Users • Waste by Type (kg)" icon={<FaChartBar />} right={
          <button onClick={loadGlobalByType} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Refresh</button>
        }>
          <div className="h-80">
            {globalByType.length === 0 ? (
              <div className="text-sm text-gray-500">No data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={globalByType} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kg" name="Kilograms" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Recent Collected" icon={<FaChartLine />}>
          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {collected.slice(0, 12).map(r => (
              <div key={r.id} className="p-3 rounded-lg border bg-gray-50 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold">{r.type}</div>
                  <div className="text-xs text-gray-500">{r.residentId}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-700 font-semibold">{Number(r.collectedKg || r.quantityKg || 0).toFixed(1)} kg</div>
                </div>
              </div>
            ))}
            {collected.length === 0 && <div className="text-sm text-gray-500">No collected records.</div>}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white flex items-center justify-center">♻️</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">UrbanWaste360 • Admin</div>
              <div className="text-xs text-gray-500">Manage users, requests, schedules & analytics</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {admin && (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold">{admin.name || 'Admin'}</div>
                  <div className="text-xs text-gray-500">{admin.email}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                  <FaUser />
                </div>
              </div>
            )}
            <button onClick={logout} className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm flex items-center gap-2">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
            <nav className="space-y-2">
              {[
                { id: 'analytics', label: 'Analytics', icon: FaChartBar },
                { id: 'users', label: 'Users', icon: FaUsers },
                { id: 'requests', label: 'Sell Requests', icon: FaRecycle },
                { id: 'schedule', label: 'Scheduling', icon: FaCalendarAlt },
                { id: 'profile', label: 'Admin Profile', icon: FaUser },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center ${
                      tab === item.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <Icon className="mr-3 text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 space-y-6">
            {tab === 'analytics' && AnalyticsTab}
            {tab === 'users' && UsersTab}
            {tab === 'requests' && RequestsTab}
            {tab === 'schedule' && ScheduleTab}
            {tab === 'profile' && (
              <SectionCard title="Admin Profile" icon={<FaUser />}>
                {admin ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><div className="text-sm text-gray-600 mb-1">Name</div><div className="font-semibold">{admin.name || '—'}</div></div>
                    <div><div className="text-sm text-gray-600 mb-1">Email</div><div className="font-semibold">{admin.email || '—'}</div></div>
                    <div><div className="text-sm text-gray-600 mb-1">Role</div><div className="font-semibold">{admin.role || 'ADMIN'}</div></div>
                    <div><div className="text-sm text-gray-600 mb-1">Phone</div><div className="font-semibold">{admin.number || admin.phone || '—'}</div></div>
                    <div className="md:col-span-2"><div className="text-sm text-gray-600 mb-1">Address</div><div className="font-semibold">{admin.address || '—'}</div></div>
                  </div>
                ) : <div className="text-sm text-gray-500">Loading profile…</div>}
              </SectionCard>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;