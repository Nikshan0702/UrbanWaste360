import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { WasteAPI } from "../api/waste";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement,Filler,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Filler);

const RECYCLABLE = ["Plastic", "Paper", "Glass", "Metal"];
const TIERS = [
  { name: "Bronze",  min: 0, color: "#9ca3af" },
  { name: "Silver",  min: 500, color: "#94a3b8" },
  { name: "Gold",    min: 1500, color: "#facc15" },
  { name: "Premium", min: 3000, color: "#22c55e" },
];



const getTier = (points) => {
  const tier = [...TIERS].reverse().find(t => points >= t.min) || TIERS[0];
  const idx = TIERS.findIndex(t => t.name === tier.name);
  const next = TIERS[idx + 1] || null;
  return { tier, next };
};

const Badge = ({ label, color = "#94a3b8" }) => (
  <div className="inline-flex items-center gap-2">
    <svg width="42" height="42" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill={color} opacity="0.8" />
      <text x="32" y="38" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
        ★
      </text>
    </svg>
    <span className="font-semibold">{label}</span>
  </div>
);

export default function RecyclingCreditsPlus() {
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [hasShownBadge, setHasShownBadge] = useState(false);
  const [records, setRecords] = useState([]);
  const [streak, setStreak] = useState(0);

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("userData") || "{}"); } catch { return {}; }
  })();
  const userId = storedUser?.id || storedUser?._id || storedUser?.userId || "";
  const { tier, next } = useMemo(() => getTier(points), [points]);

  // Compute daily streak & breakdown
  const recyclableTotals = useMemo(() => {
    const byType = { Plastic:0, Paper:0, Glass:0, Metal:0 };
    records.forEach(r => {
      if (RECYCLABLE.includes(r.type)) {
        byType[r.type] = (byType[r.type] || 0) + Number(r.quantity || 0);
      }
    });
    return byType;
  }, [records]);

  const totalRecyclable = useMemo(
    () => Object.values(recyclableTotals).reduce((a,b) => a + b, 0),
    [recyclableTotals]
  );

  const progressToNext = useMemo(() => {
    if (!next) return 100;
    const span = next.min - tier.min;
    const done = points - tier.min;
    return Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  }, [points, tier, next]);

  // calculate recycling streak (days user added recyclable waste)
  const calcStreak = (rows) => {
    const days = [...new Set(rows
      .filter(r => RECYCLABLE.includes(r.type))
      .map(r => (r.date || "").slice(0,10))
    )].sort();
    if (!days.length) return 0;

    let streak = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const d1 = new Date(days[i]);
      const d0 = new Date(days[i-1]);
      const diff = (d1 - d0) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else if (diff > 1) break;
    }
    return streak;
  };

  const pieData = useMemo(() => ({
    labels: Object.keys(recyclableTotals),
    datasets: [{
      data: Object.values(recyclableTotals),
      backgroundColor: ["#3b82f6","#facc15","#f87171","#a855f7"],
      borderColor: "#fff",
      borderWidth: 2,
    }]
  }), [recyclableTotals]);

  const barData = useMemo(() => ({
    labels: Object.keys(recyclableTotals),
    datasets: [{
      label: "Recyclable Waste (kg)",
      data: Object.values(recyclableTotals),
      backgroundColor: ["#3b82f6","#facc15","#f87171","#a855f7"],
      borderRadius: 8,
    }],
  }), [recyclableTotals]);

  const load = async () => {
    setLoading(true);
    try {
      const c = await WasteAPI.credits(userId);
      setPoints(c.points ?? Number(c) ?? 0);

      const rows = await WasteAPI.list(userId ? { residentId: userId } : {});
      setRecords(Array.isArray(rows) ? rows : []);

      setStreak(calcStreak(rows));
    } catch (e) {
      console.error("RecyclingCredits load error:", e);
      setPoints(0);
      setRecords([]);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  };

    const [showRedeem, setShowRedeem] = useState(false);
    const [reward, setReward] = useState(null);

    const REWARDS = [
    { name: "Tree Planting Certificate", cost: 800, desc: "We'll plant a tree in your name 🌱" },
    { name: "Eco Shopping Voucher", cost: 1200, desc: "Use this for sustainable products 🛒" },
    { name: "Premium Recycler Badge", cost: 2000, desc: "Exclusive recognition for top recyclers 🥇" },
    ];

    const kgSaved = totalRecyclable;
    const treesSaved = Math.round(kgSaved / 15);
    const co2Reduced = Math.round(kgSaved * 1.5);
    const energySaved = Math.round(kgSaved * 0.3);

    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
    useEffect(() => {
        if (!hasShownBadge && next && points >= next.min) {
            setHasShownBadge(true);

            // Simple toast version:
            // alert(`🎉 Congratulations! You've unlocked ${next.name} Tier!`);
            toast.success(`🎉 You've unlocked the ${next.name} Tier!`);

            // OR if you installed react-hot-toast (optional):
            // toast.success(`🎉 You've unlocked the ${next.name} Tier!`);
        }
    }, [points, next, hasShownBadge]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="rounded-xl border p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-slate-500">Total Points</div>
          <div className="text-3xl font-bold">{points}</div>
          <div className="mt-2"><Badge label={tier.name} color={tier.color} /></div>
          <div className="text-xs text-slate-500 mt-2">Recycling Streak: <b>{streak} days 🔥</b></div>
        </div>

        <div className="md:w-1/2">
          <div className="text-sm text-slate-500 mb-1">
            {next ? `Progress to ${next.name}` : "You’re at the top tier!"}
          </div>
          <div className="w-full h-3 bg-teal-100 rounded-full overflow-hidden">
            <div className="h-full" style={{ width: `${progressToNext}%`, background: "linear-gradient(90deg, #10B981 0%, #0D9488 100%)" }} />
          </div>
          {next && (
            <div className="text-xs text-slate-500 mt-1">
              {next.min - points} more points to unlock {next.name}
            </div>
          )}
          </div>
        </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 bg-white lg:col-span-2">
          <h3 className="font-semibold mb-2">Recyclable Waste Summary</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <h3 className="font-semibold mb-2">Recycling Composition</h3>
          <Pie data={pieData} />
        </div>
      </div>

      {/* REWARDS */}
      <div className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-3">Available Rewards</h3>
        <ul className="grid md:grid-cols-3 gap-4">
          <RewardCard name="Silver Badge" pts={500} desc="Keep recycling to unlock Silver tier." color="#94a3b8" />
          <RewardCard name="Gold Badge" pts={1500} desc="Exceptional recycler! Gold unlocks new perks." color="#facc15" />
          <RewardCard name="Premium Badge" pts={3000} desc="Top recycler status! Access premium rewards." color="#22c55e" />
        </ul>
      </div>

      {/* LEADERBOARD (mock preview) */}
      <div className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-3">Top Recyclers This Month 🌍</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Rank</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {[{name:"Vanaiyalini K.", pts:2450},{name:"Gajaruban M.", pts:1800},{name:"Naveeth R.", pts:1350}]
              .map((u,i)=>(
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{i+1}</td>
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2 font-semibold">{u.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


     <div className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-3">Redeem Rewards</h3>
        <div className="grid md:grid-cols-3 gap-4">
            {REWARDS.map(r => (
            <div key={r.name} className="border rounded-lg p-3">
                <div className="font-semibold">{r.name}</div>
                <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
                <div className="mt-2 flex justify-between items-center">
                <span className="text-sm">{r.cost} pts</span>
                <button
                    disabled={points < r.cost}
                    onClick={() => { setReward(r); setShowRedeem(true); }}
                    className={`px-3 py-1 rounded-md text-white ${points >= r.cost ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-gray-400"}`}
                >
                    Redeem
                </button>
                </div>
            </div>
            ))}
        </div>
     </div>


     <div className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-3">Your Recycling Journey</h3>
        <ul className="border-l-2 border-emerald-400 pl-4 space-y-3 text-sm">
            <li><b>Joined UrbanWaste360</b> — Welcome aboard 👋</li>
            {points > 500 && <li>🏅 Reached <b>Silver Tier</b></li>}
            {points > 1500 && <li>🥇 Earned <b>Gold Tier</b></li>}
            {points > 3000 && <li>🌟 Achieved <b>Premium Recycler</b></li>}
            {streak > 7 && <li>🔥 Maintained <b>{streak}-day recycling streak</b></li>}
        </ul>
    </div>




    <div className="rounded-xl border p-4 bg-white text-sm">
    <h3 className="font-semibold mb-2">🌍 Your Environmental Impact</h3>
    <ul className="space-y-1 text-slate-600">
        <li>🌳 <b>{treesSaved}</b> trees worth of paper saved</li>
        <li>💨 <b>{co2Reduced}</b> kg of CO₂ emissions reduced</li>
        <li>⚡ <b>{energySaved}</b> kWh of energy conserved</li>
    </ul>
    </div>



    {showRedeem && (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h3 className="font-semibold text-lg">Confirm Redemption</h3>
        <p className="text-sm text-slate-600 mt-2">
            Redeem <b>{reward.name}</b> for <b>{reward.cost} points</b>?
        </p>
        <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowRedeem(false)} className="px-3 py-1 border rounded-lg">Cancel</button>
            <button
            onClick={() => {
                setPoints(p => p - reward.cost);
                setShowRedeem(false);
                alert(`✅ ${reward.name} redeemed successfully!`);
            }}
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg"
            >
            Confirm
            </button>
        </div>
        </div>
    </div>
    )}

    </div>
  );
}

const RewardCard = ({ name, pts, desc, color }) => (
  <li className="rounded-lg border p-3 hover:shadow-md transition-all duration-200">
    <Badge label={name} color={color} />
    <p className="text-sm text-slate-600 mt-2">{desc}</p>
    <div className="text-xs text-slate-500 mt-1">Requires {pts} points</div>
  </li>
);
