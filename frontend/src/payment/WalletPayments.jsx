// // src/components/WalletPayments.jsx
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   FaWallet,
//   FaMoneyBillWave,
//   FaCreditCard,
//   FaHistory,
//   FaShieldAlt,
//   FaCheckCircle,
// } from 'react-icons/fa';

// const API = 'http://localhost:8080';

// // Always append residentId if present; also forward JWT if available.
// const authFetch = async (path, { method = 'GET', body, headers = {}, userId, includeJson = true } = {}) => {
//   const token = localStorage.getItem('authToken');
//   let url = `${API}${path}`;
//   if (userId && !url.includes('residentId=')) {
//     url += (url.includes('?') ? '&' : '?') + `residentId=${encodeURIComponent(userId)}`;
//   }
//   const finalHeaders = {
//     ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
//     ...headers,
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
//   return fetch(url, {
//     method,
//     headers: finalHeaders,
//     credentials: 'include',
//     ...(body ? { body: includeJson ? JSON.stringify(body) : body } : {}),
//   });
// };

// const WalletPayments = () => {
//   const [user, setUser] = useState(null);
//   const [walletBalance, setWalletBalance] = useState(0);
//   const [outstanding, setOutstanding] = useState(0);
//   const [paymentHistory, setPaymentHistory] = useState([]);

//   const [amount, setAmount] = useState('');
//   const [method, setMethod] = useState('WALLET'); // 'WALLET' | 'CARD'
//   const [cardToken, setCardToken] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Load user once
//   useEffect(() => {
//     const stored = localStorage.getItem('userData');
//     if (stored) {
//       try {
//         setUser(JSON.parse(stored));
//       } catch {
//         setUser(null);
//       }
//     }
//   }, []);

//   // Fetch balances/history
//   useEffect(() => {
//     if (!user?.id) return;
//     fetchWallet();
//     fetchOutstanding();
//     fetchHistory();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   const fetchWallet = async () => {
//     try {
//       const res = await fetch(`${API}/api/payments/wallet/${user.id}`, { credentials: 'include' });
//       if (res.ok) {
//         const data = await res.json();
//         setWalletBalance(data.balance || 0);
//       }
//     } catch (_) {}
//   };

//   const fetchOutstanding = async () => {
//     try {
//       const res = await authFetch(`/api/payments/outstanding`, { userId: user.id });
//       if (res.ok) {
//         const data = await res.json();
//         setOutstanding(data.outstanding || 0);
//       }
//     } catch (_) {}
//   };

//   const fetchHistory = async () => {
//     try {
//       const token = localStorage.getItem('authToken');
//       const res = await fetch(`${API}/api/payments/history/${user.id}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         credentials: 'include',
//       });
//       if (res.ok) {
//         setPaymentHistory(await res.json());
//       }
//     } catch (_) {}
//   };

//   const totalIncome = useMemo(
//     () => paymentHistory.filter(p => p.type === 'income').reduce((s, p) => s + (p.amount || 0), 0),
//     [paymentHistory]
//   );
//   const totalPayments = useMemo(
//     () => paymentHistory.filter(p => p.type === 'payment').reduce((s, p) => s + (p.amount || 0), 0),
//     [paymentHistory]
//   );

//   const pay = async () => {
//     const amt = parseFloat(amount);
//     if (!amt || amt <= 0) return alert('Enter a valid amount');
//     if (method === 'CARD' && !cardToken) return alert('Enter a card token');

//     setLoading(true);
//     try {
//       const res = await authFetch(`/api/payments/settle`, {
//         method: 'POST',
//         userId: user.id,
//         body: { amount: amt, method, cardToken: method === 'CARD' ? cardToken : undefined },
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setOutstanding(data.remaining || 0);
//         setAmount('');
//         setCardToken('');
//         await fetchWallet();
//         await fetchHistory();
//         alert(method === 'WALLET' ? 'Paid with wallet' : 'Card payment successful');
//       } else {
//         alert(await res.text());
//       }
//     } catch (e) {
//       alert('Payment failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-4xl mb-2">🔒</div>
//           <p className="text-gray-600">Please log in to view your wallet and payments.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//           <div className="flex items-center justify-between flex-wrap gap-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
//               <p className="text-gray-600 text-sm mt-1">
//                 Manage your wallet balance, settle outstanding charges, and view history.
//               </p>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-gray-500">Signed in as</div>
//               <div className="font-semibold text-gray-900">{user.name || user.email}</div>
//             </div>
//           </div>
//         </div>

//         {/* Top KPIs */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow text-white p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-emerald-100 text-sm">Wallet Balance</p>
//                 <p className="text-3xl font-bold mt-2">LKR {walletBalance.toFixed(2)}</p>
//                 <p className="text-emerald-100 text-xs mt-2">Available for payments</p>
//               </div>
//               <FaWallet className="text-4xl opacity-90" />
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow text-white p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-green-100 text-sm">Total Income</p>
//                 <p className="text-3xl font-bold mt-2">LKR {totalIncome.toFixed(2)}</p>
//                 <p className="text-green-100 text-xs mt-2">From waste sales</p>
//               </div>
//               <FaMoneyBillWave className="text-4xl opacity-90" />
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow text-white p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-indigo-100 text-sm">Total Payments</p>
//                 <p className="text-3xl font-bold mt-2">LKR {totalPayments.toFixed(2)}</p>
//                 <p className="text-indigo-100 text-xs mt-2">Service fees paid</p>
//               </div>
//               <FaCreditCard className="text-4xl opacity-90" />
//             </div>
//           </div>
//         </div>

//         {/* Wallet + Make Payment */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Outstanding + Make Payment */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Make a Payment</h2>

//             <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm">
//                   <div className="text-blue-800 font-semibold">Outstanding Charges</div>
//                   <div className="text-blue-600">Pay with wallet or card</div>
//                 </div>
//                 <div className="text-2xl font-bold text-blue-700">LKR {outstanding.toFixed(2)}</div>
//               </div>
//             </div>

//             <div className="mb-5">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Amount (LKR)</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={amount}
//                 onChange={e => setAmount(e.target.value)}
//                 placeholder="Enter amount"
//                 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//               />
//               <div className="text-xs text-gray-500 mt-1">
//                 Tip: You can pay the full outstanding ({outstanding.toFixed(2)}) or a partial amount.
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={() => setMethod('WALLET')}
//                 className={`p-3 rounded-lg border text-left flex items-center gap-3 ${
//                   method === 'WALLET' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
//                 }`}
//               >
//                 <div className={`p-2 rounded ${method === 'WALLET' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
//                   <FaWallet />
//                 </div>
//                 <div>
//                   <div className="font-semibold text-gray-900">Wallet</div>
//                   <div className="text-xs text-gray-500">Balance: LKR {walletBalance.toFixed(2)}</div>
//                 </div>
//                 {method === 'WALLET' && <FaCheckCircle className="ml-auto text-emerald-600" />}
//               </button>

//               <button
//                 onClick={() => setMethod('CARD')}
//                 className={`p-3 rounded-lg border text-left flex items-center gap-3 ${
//                   method === 'CARD' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
//                 }`}
//               >
//                 <div className={`p-2 rounded ${method === 'CARD' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
//                   <FaCreditCard />
//                 </div>
//                 <div>
//                   <div className="font-semibold text-gray-900">Card</div>
//                   <div className="text-xs text-gray-500">Visa / Mastercard</div>
//                 </div>
//                 {method === 'CARD' && <FaCheckCircle className="ml-auto text-indigo-600" />}
//               </button>
//             </div>

//             {method === 'CARD' && (
//               <div className="mt-5">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Card Token</label>
//                 <input
//                   type="text"
//                   placeholder="tok_xxx (from your PSP)"
//                   value={cardToken}
//                   onChange={e => setCardToken(e.target.value)}
//                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   We don’t store card details here—use a token from your payment provider.
//                 </p>
//               </div>
//             )}

//             <button
//               onClick={pay}
//               disabled={loading || !amount || parseFloat(amount) <= 0}
//               className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold mt-6 flex items-center justify-center gap-2"
//             >
//               <FaCreditCard />
//               {loading ? 'Processing...' : `Pay LKR ${amount ? parseFloat(amount).toFixed(2) : '0.00'}`}
//             </button>

//             <div className="text-center mt-3">
//               <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
//                 <FaShieldAlt className="text-emerald-500" />
//                 Your payment is secure and encrypted.
//               </p>
//             </div>
//           </div>

//           {/* Wallet Snapshot / Refresh */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Wallet Snapshot</h2>
//             <div className="rounded-xl p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white mb-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-emerald-100 text-sm">Current Balance</div>
//                   <div className="text-4xl font-bold mt-2">LKR {walletBalance.toFixed(2)}</div>
//                   <div className="text-emerald-100 text-xs mt-2">Updated in real-time</div>
//                 </div>
//                 <FaWallet className="text-5xl opacity-95" />
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={fetchWallet}
//                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
//               >
//                 Refresh Balance
//               </button>
//               <button
//                 onClick={fetchOutstanding}
//                 className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
//               >
//                 Refresh Outstanding
//               </button>
//               <button
//                 onClick={fetchHistory}
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
//               >
//                 Refresh History
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* History */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//               <FaHistory className="text-indigo-600" />
//               Transaction History
//             </h2>
//             <div className="text-sm text-gray-500">
//               Showing {paymentHistory.length} record{paymentHistory.length !== 1 ? 's' : ''}
//             </div>
//           </div>

//           {paymentHistory.length === 0 ? (
//             <div className="text-center py-10">
//               <div className="text-4xl mb-2">📄</div>
//               <p className="text-gray-500">No transactions yet</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//               {paymentHistory.map((p) => {
//                 const isIncome = p.type === 'income';
//                 const status = (p.status || '').toLowerCase();
//                 return (
//                   <div key={p.id} className="p-4 rounded-xl border border-gray-200 hover:shadow-sm transition">
//                     <div className="flex items-center justify-between mb-2">
//                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
//                         {isIncome ? <FaMoneyBillWave /> : <FaCreditCard />}
//                       </div>
//                       <div
//                         className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                           status === 'completed'
//                             ? 'text-green-700 bg-green-100'
//                             : status === 'failed'
//                             ? 'text-red-700 bg-red-100'
//                             : 'text-yellow-700 bg-yellow-100'
//                         }`}
//                       >
//                         {p.status || 'PENDING'}
//                       </div>
//                     </div>
//                     <div className="font-semibold text-gray-900 text-sm">{p.description || (isIncome ? 'Credit' : 'Payment')}</div>
//                     <div className={`font-bold mt-1 ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
//                       {isIncome ? '+' : '-'}LKR {Math.abs(p.amount || 0).toFixed(2)}
//                     </div>
//                     <div className="text-xs text-gray-500 mt-1">
//                       {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WalletPayments;

// src/components/WalletPaymentsCardUI.jsx
// src/components/WalletPaymentsCardUI.jsx
// import React, { useEffect, useMemo, useState } from 'react';
// import { FaWallet, FaMoneyBillWave, FaCreditCard, FaHistory, FaShieldAlt } from 'react-icons/fa';

// const API = 'http://localhost:8080';
// const isDevToken = (t) => !t || t === 'demo-token' || t === 'null' || t === 'undefined';

// const authFetch = async (path, { method = 'GET', body, headers = {}, userId } = {}) => {
//   const token = localStorage.getItem('authToken');
//   let url = `${API}${path}`;
//   // In dev (no real JWT), append residentId to avoid 400
//   if (userId && !url.includes('residentId=')) {
//     url += (url.includes('?') ? '&' : '?') + `residentId=${encodeURIComponent(userId)}`;
//   }
//   const finalHeaders = {
//     'Content-Type': 'application/json',
//     ...(token && !isDevToken(token) ? { Authorization: `Bearer ${token}` } : {}),
//     ...headers,
//   };
//   return fetch(url, {
//     method,
//     headers: finalHeaders,
//     credentials: 'include',
//     ...(body ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
//   });
// };

// const Card = ({ children, className = '' }) => (
//   <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>{children}</div>
// );
// const CardHeader = ({ title, icon, right }) => (
//   <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
//     <div className="flex items-center gap-3">
//       <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center">{icon}</div>
//       <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
//     </div>
//     {right}
//   </div>
// );
// const CardBody = ({ children }) => <div className="p-6">{children}</div>;

// export default function WalletPaymentsCardUI() {
//   const [user, setUser] = useState(null);

//   const [wallet, setWallet] = useState(0);
//   const [outstanding, setOutstanding] = useState(0);
//   const [history, setHistory] = useState([]);

//   const [amount, setAmount] = useState('');
//   const [method, setMethod] = useState('WALLET'); // WALLET | CARD
//   const [loading, setLoading] = useState(false);

//   const [cardNumber, setCardNumber] = useState('');
//   const [expiry, setExpiry] = useState('');
//   const [cvv, setCvv] = useState('');
//   const [holder, setHolder] = useState('');

//   useEffect(() => {
//     const stored = localStorage.getItem('userData');
//     if (stored) {
//       try { setUser(JSON.parse(stored)); } catch {}
//     }
//   }, []);

//   useEffect(() => {
//     if (!user?.id) return;
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   const refreshAll = async () => {
//     await Promise.all([fetchWallet(), fetchOutstanding(), fetchHistory()]);
//   };

//   const fetchWalletBalance = async () => {
//     try {
//       // either shape works; this calls /api/payments/wallet?residentId=...
//       const res = await authFetch(`/api/payments/wallet`, { userId }, userId);
//       if (res.ok) {
//         const data = await res.json();
//         setWalletBalance(Number(data.balance || 0));
//       } else {
//         console.error('wallet →', res.status, await res.text());
//         setWalletBalance(0);
//       }
//     } catch (e) {
//       console.error('Error fetching wallet balance:', e);
//       setWalletBalance(0);
//     }
//   };

//   const fetchOutstanding = async () => {
//     const r = await authFetch(`/api/payments/outstanding`, { userId: user.id });
//     if (r.ok) {
//       const data = await r.json();
//       setOutstanding(data.outstanding || 0);
//     }
//   };

//   const fetchHistory = async () => {
//     // hits /history/{id}
//     const r = await authFetch(`/api/payments/history/${user.id}`, { userId: user.id });
//     if (r.ok) setHistory(await r.json());
//   };

//   const totalIncome = useMemo(
//     () => history.filter(h => h.type === 'income').reduce((s, x) => s + (x.amount || 0), 0),
//     [history]
//   );
//   const totalPayments = useMemo(
//     () => history.filter(h => h.type === 'payment').reduce((s, x) => s + (x.amount || 0), 0),
//     [history]
//   );

//   const fakeTokenize = () => {
//     const last4 = (cardNumber || '').replace(/\s+/g, '').slice(-4);
//     const exp = (expiry || '').replace(/\D/g, '');
//     return last4 ? `tok_${last4}_${exp || 'XXXX'}` : '';
//     // Replace with your PSP’s real tokenization.
//   };

//   const pay = async () => {
//     const amt = parseFloat(amount);
//     if (!amt || amt <= 0) return alert('Enter a valid amount');

//     if (method === 'WALLET') {
//       if (amt > wallet) return alert('Insufficient wallet balance');
//     }

//     let cardToken;
//     if (method === 'CARD') {
//       if (!cardNumber || !expiry || !cvv || !holder) return alert('Enter all card details');
//       cardToken = fakeTokenize();
//     }

//     setLoading(true);
//     try {
//       const r = await authFetch(`/api/payments/settle`, {
//         method: 'POST',
//         userId: user.id, // ensures residentId is appended in dev
//         body: { amount: amt, method, cardToken },
//       });
//       if (r.ok) {
//         const data = await r.json();
//         setOutstanding(data.remaining || 0);
//         setAmount('');
//         setCardNumber(''); setExpiry(''); setCvv(''); setHolder('');
//         await fetchWallet();
//         await fetchHistory();
//         alert(method === 'WALLET' ? 'Paid with wallet' : 'Card payment successful');
//       } else {
//         alert(await r.text());
//       }
//     } catch {
//       alert('Payment failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) {
//     return (
//       <div className="min-h-[60vh] grid place-items-center">
//         <div className="text-center text-gray-600">
//           <div className="text-4xl mb-2">🔒</div>
//           Please log in to access Wallet & Payments.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto space-y-8">

//         {/* Top KPI cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/80 text-sm">Wallet Balance</p>
//                 <p className="text-3xl font-bold mt-2">LKR {wallet.toFixed(2)}</p>
//               </div>
//               <FaWallet className="text-4xl opacity-90" />
//             </div>
//           </div>
//           <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-green-600 to-green-700 shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/80 text-sm">Total Income</p>
//                 <p className="text-3xl font-bold mt-2">LKR {totalIncome.toFixed(2)}</p>
//               </div>
//               <FaMoneyBillWave className="text-4xl opacity-90" />
//             </div>
//           </div>
//           <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/80 text-sm">Total Payments</p>
//                 <p className="text-3xl font-bold mt-2">LKR {totalPayments.toFixed(2)}</p>
//               </div>
//               <FaCreditCard className="text-4xl opacity-90" />
//             </div>
//           </div>
//         </div>

//         {/* Outstanding card */}
//         <Card>
//           <CardHeader
//             title="Outstanding"
//             icon={<span className="text-blue-600">₨</span>}
//             right={<button onClick={fetchOutstanding} className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm">Refresh</button>}
//           />
//           <CardBody>
//             <div className="rounded-xl p-5 bg-blue-50 border border-blue-200 flex items-center justify-between">
//               <div>
//                 <div className="text-blue-900 font-semibold">Total Due</div>
//                 <div className="text-blue-700 text-sm">Pay with wallet or card</div>
//               </div>
//               <div className="text-3xl font-extrabold text-blue-900">LKR {outstanding.toFixed(2)}</div>
//             </div>
//           </CardBody>
//         </Card>

//         {/* Two payment method cards side-by-side */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Wallet card */}
//           <Card>
//             <CardHeader
//               title="Pay with Wallet"
//               icon={<FaWallet className="text-emerald-600" />}
//               right={<span className="text-xs text-gray-500">Balance: LKR {wallet.toFixed(2)}</span>}
//             />
//             <CardBody>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-1">Amount (LKR)</label>
//                   <input
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <button
//                   onClick={() => { setMethod('WALLET'); pay(); }}
//                   disabled={loading || !amount}
//                   className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60"
//                 >
//                   {loading && method === 'WALLET' ? 'Processing…' : 'Pay from Wallet'}
//                 </button>
//               </div>
//             </CardBody>
//           </Card>

//           {/* Card card */}
//           <Card>
//             <CardHeader title="Pay with Card" icon={<FaCreditCard className="text-indigo-600" />} />
//             <CardBody>
//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-sm text-gray-700 mb-1">Amount (LKR)</label>
//                   <input
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <input
//                   placeholder="Card Number"
//                   value={cardNumber}
//                   onChange={(e) => setCardNumber(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 />
//                 <div className="grid grid-cols-2 gap-3">
//                   <input
//                     placeholder="Expiry (MM/YY)"
//                     value={expiry}
//                     onChange={(e) => setExpiry(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                   <input
//                     placeholder="CVV"
//                     value={cvv}
//                     onChange={(e) => setCvv(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//                 <input
//                   placeholder="Cardholder Name"
//                   value={holder}
//                   onChange={(e) => setHolder(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                 />

//                 <button
//                   onClick={() => { setMethod('CARD'); pay(); }}
//                   disabled={loading || !amount}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60"
//                 >
//                   {loading && method === 'CARD' ? 'Processing…' : 'Pay with Card'}
//                 </button>

//                 <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
//                   <FaShieldAlt className="text-emerald-500" />
//                   We don’t store raw card details. A temporary token is generated and used for this payment.
//                 </p>
//               </div>
//             </CardBody>
//           </Card>
//         </div>

//         {/* Wallet snapshot + actions */}
//         <Card>
//           <CardHeader
//             title="Wallet Snapshot"
//             icon={<FaWallet className="text-emerald-600" />}
//             right={
//               <div className="flex gap-2">
//                 <button onClick={fetchWallet} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm hover:bg-emerald-100">
//                   Refresh Wallet
//                 </button>
//                 <button onClick={fetchOutstanding} className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm hover:bg-teal-100">
//                   Refresh Outstanding
//                 </button>
//                 <button onClick={fetchHistory} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-100">
//                   Refresh History
//                 </button>
//               </div>
//             }
//           />
//           <CardBody>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white/80 text-sm">Balance</p>
//                     <p className="text-3xl font-bold mt-2">LKR {wallet.toFixed(2)}</p>
//                   </div>
//                   <FaWallet className="text-4xl opacity-90" />
//                 </div>
//               </div>
//               <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-green-600 to-green-700 shadow">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white/80 text-sm">Income</p>
//                     <p className="text-3xl font-bold mt-2">LKR {totalIncome.toFixed(2)}</p>
//                   </div>
//                   <FaMoneyBillWave className="text-4xl opacity-90" />
//                 </div>
//               </div>
//               <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 shadow">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-white/80 text-sm">Payments</p>
//                     <p className="text-3xl font-bold mt-2">LKR {totalPayments.toFixed(2)}</p>
//                   </div>
//                   <FaCreditCard className="text-4xl opacity-90" />
//                 </div>
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         {/* History as cards */}
//         <Card>
//           <CardHeader title="Transaction History" icon={<FaHistory className="text-indigo-600" />} right={
//             <div className="text-sm text-gray-500">Showing {history.length} record{history.length !== 1 ? 's' : ''}</div>
//           } />
//           <CardBody>
//             {history.length === 0 ? (
//               <div className="text-center text-gray-500 py-10">No transactions yet</div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {history.map((p) => {
//                   const isIncome = p.type === 'income';
//                   const status = (p.status || '').toUpperCase();
//                   const chip =
//                     status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
//                     status === 'FAILED' ? 'text-rose-700 bg-rose-100' : 'text-yellow-700 bg-yellow-100';
//                   return (
//                     <div key={p.id} className="p-4 rounded-xl border border-gray-200 hover:shadow-sm transition">
//                       <div className="flex items-center justify-between mb-2">
//                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
//                           {isIncome ? <FaMoneyBillWave /> : <FaCreditCard />}
//                         </div>
//                         <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${chip}`}>{status}</div>
//                       </div>
//                       <div className="font-semibold text-gray-900 text-sm">{p.paymentMethod || (isIncome ? 'Credit' : 'Payment')}</div>
//                       <div className={`font-bold mt-1 ${isIncome ? 'text-green-600' : 'text-rose-600'}`}>
//                         {isIncome ? '+' : '-'} LKR {Math.abs(p.amount || 0).toFixed(2)}
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardBody>
//         </Card>
//       </div>
//     </div>
//   );
// }
// src/components/WalletPaymentsCardUI.jsx
// src/components/WalletPaymentsCardUI.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FaWallet, FaMoneyBillWave, FaCreditCard, FaHistory, FaShieldAlt } from 'react-icons/fa';

const API = 'http://localhost:8080';
const isDevToken = (t) => !t || t === 'demo-token' || t === 'null' || t === 'undefined';

/** Fetch helper
 * - Always appends residentId=<userId> when provided (helps dev and your PaymentController in insecure mode)
 * - Sends JWT if present (for secure mode)
 */
const authFetch = async (path, { method = 'GET', body, headers = {}, userId } = {}) => {
  const token = localStorage.getItem('authToken');
  let url = `${API}${path}`;
  if (userId && !url.includes('residentId=')) {
    url += (url.includes('?') ? '&' : '?') + `residentId=${encodeURIComponent(userId)}`;
  }
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(token && !isDevToken(token) ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  return fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    ...(body ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ title, icon, right }) => (
  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    {right}
  </div>
);
const CardBody = ({ children }) => <div className="p-6">{children}</div>;

export default function WalletPaymentsCardUI() {
  const [user, setUser] = useState(null);

  // balances & data
  const [wallet, setWallet] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [history, setHistory] = useState([]);

  // separate amounts for wallet vs card
  const [amountWallet, setAmountWallet] = useState('');
  const [amountCard, setAmountCard] = useState('');

  // card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holder, setHolder] = useState('');

  const [loadingWalletPay, setLoadingWalletPay] = useState(false);
  const [loadingCardPay, setLoadingCardPay] = useState(false);

  // error notice (non-blocking)
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const refreshAll = async () => {
    setNotice('');
    await Promise.all([fetchWallet(), fetchOutstanding(), fetchHistory()]);
  };

  /** Robust wallet fetch:
   * 1) /api/payments/wallet?residentId=<id>  (PaymentController @GetMapping("/wallet"))
   * 2) /api/payments/wallet/<id>?residentId=<id> (PaymentController path mapping)
   * 3) /api/payments/wallet/<id>  (WalletQueryController fallback)
   */
  const fetchWallet = async () => {
    if (!user?.id) return;
    try {
      // 1) query param
      let res = await authFetch(`/api/payments/wallet`, { userId: user.id });
      if (res.ok) {
        const data = await res.json();
        setWallet(Number(data.balance || 0));
        return;
      }
      // 2) path + query
      res = await authFetch(`/api/payments/wallet/${user.id}`, { userId: user.id });
      if (res.ok) {
        const data = await res.json();
        setWallet(Number(data.balance || 0));
        return;
      }
      // 3) plain path (WalletQueryController)
      res = await fetch(`${API}/api/payments/wallet/${user.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWallet(Number(data.balance || 0));
        return;
      }
      setWallet(0);
      setNotice(`Wallet fetch failed: ${res.status} ${await res.text()}`);
    } catch (e) {
      setWallet(0);
      setNotice('Could not reach wallet API.');
      // console.error(e);
    }
  };

  const fetchOutstanding = async () => {
    if (!user?.id) return;
    try {
      const r = await authFetch(`/api/payments/outstanding`, { userId: user.id });
      if (r.ok) {
        const data = await r.json();
        setOutstanding(Number(data.outstanding || 0));
      } else {
        setNotice(`Outstanding fetch failed: ${r.status} ${await r.text()}`);
      }
    } catch {
      setNotice('Could not reach outstanding API.');
    }
  };

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      const r = await authFetch(`/api/payments/history/${user.id}`, { userId: user.id });
      if (r.ok) setHistory(await r.json());
      else setNotice(`History fetch failed: ${r.status} ${await r.text()}`);
    } catch {
      setNotice('Could not reach history API.');
    }
  };

  const totalIncome = useMemo(
    () => history.filter(h => String(h.type).toLowerCase() === 'income').reduce((s, x) => s + (x.amount || 0), 0),
    [history]
  );
  const totalPayments = useMemo(
    () => history.filter(h => String(h.type).toLowerCase() === 'payment').reduce((s, x) => s + (x.amount || 0), 0),
    [history]
  );

  // fake PSP tokenization (replace with your PSP)
  const makeCardToken = () => {
    const last4 = (cardNumber || '').replace(/\s+/g, '').slice(-4);
    const exp = (expiry || '').replace(/\D/g, '');
    return last4 ? `tok_${last4}_${exp || 'XXXX'}` : '';
  };

  const postSettle = async ({ amount, method, cardToken }) => {
    return authFetch(`/api/payments/settle`, {
      method: 'POST',
      userId: user.id,
      body: { amount, method, cardToken },
    });
  };

  const payWithWallet = async () => {
    const amt = parseFloat(amountWallet);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (amt > wallet) return alert('Insufficient wallet balance');

    setLoadingWalletPay(true);
    setNotice('');
    try {
      const r = await postSettle({ amount: amt, method: 'WALLET' });
      if (r.ok) {
        const data = await r.json();
        setOutstanding(Number(data.remaining || 0));
        setAmountWallet('');
        await Promise.all([fetchWallet(), fetchHistory()]);
        alert('Paid with wallet');
      } else {
        alert(await r.text());
      }
    } catch {
      alert('Payment failed.');
    } finally {
      setLoadingWalletPay(false);
    }
  };

  const payWithCard = async () => {
    const amt = parseFloat(amountCard);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (!cardNumber || !expiry || !cvv || !holder) return alert('Enter all card details');

    setLoadingCardPay(true);
    setNotice('');
    try {
      const cardToken = makeCardToken();
      const r = await postSettle({ amount: amt, method: 'CARD', cardToken });
      if (r.ok) {
        const data = await r.json();
        setOutstanding(Number(data.remaining || 0));
        setAmountCard('');
        setCardNumber(''); setExpiry(''); setCvv(''); setHolder('');
        await Promise.all([fetchWallet(), fetchHistory()]);
        alert('Card payment successful');
      } else {
        alert(await r.text());
      }
    } catch {
      alert('Payment failed.');
    } finally {
      setLoadingCardPay(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-2">🔒</div>
          Please log in to access Wallet & Payments.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Optional notice */}
        {notice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl">
            {notice}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold mt-2">LKR {wallet.toFixed(2)}</p>
                <button
                  onClick={fetchWallet}
                  className="text-xs mt-2 px-2 py-1 rounded bg-white/15 hover:bg-white/25"
                >
                  Refresh
                </button>
              </div>
              <FaWallet className="text-4xl opacity-90" />
            </div>
          </div>
          <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-green-600 to-green-700 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Income</p>
                <p className="text-3xl font-bold mt-2">LKR {totalIncome.toFixed(2)}</p>
              </div>
              <FaMoneyBillWave className="text-4xl opacity-90" />
            </div>
          </div>
          <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Payments</p>
                <p className="text-3xl font-bold mt-2">LKR {totalPayments.toFixed(2)}</p>
              </div>
              <FaCreditCard className="text-4xl opacity-90" />
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <Card>
          <CardHeader
            title="Outstanding"
            icon={<span className="text-blue-600">₨</span>}
            right={<button onClick={fetchOutstanding} className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm">Refresh</button>}
          />
          <CardBody>
            <div className="rounded-xl p-5 bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="text-blue-900 font-semibold">Total Due</div>
                <div className="text-blue-700 text-sm">Pay with wallet or card</div>
              </div>
              <div className="text-3xl font-extrabold text-blue-900">LKR {outstanding.toFixed(2)}</div>
            </div>
          </CardBody>
        </Card>

        {/* Payment methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet */}
          <Card>
            <CardHeader
              title="Pay with Wallet"
              icon={<FaWallet className="text-emerald-600" />}
              right={<span className="text-xs text-gray-500">Balance: LKR {wallet.toFixed(2)}</span>}
            />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Amount (LKR)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amountWallet}
                    onChange={(e) => setAmountWallet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={payWithWallet}
                  disabled={loadingWalletPay || !amountWallet}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60"
                >
                  {loadingWalletPay ? 'Processing…' : 'Pay from Wallet'}
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Card */}
          <Card>
            <CardHeader title="Pay with Card" icon={<FaCreditCard className="text-indigo-600" />} />
            <CardBody>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Amount (LKR)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amountCard}
                    onChange={(e) => setAmountCard(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
                <input
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Expiry (MM/YY)"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <input
                  placeholder="Cardholder Name"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={payWithCard}
                  disabled={loadingCardPay || !amountCard}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60"
                >
                  {loadingCardPay ? 'Processing…' : 'Pay with Card'}
                </button>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                  <FaShieldAlt className="text-emerald-500" />
                  We don’t store raw card details. A temporary token is generated and used for this payment.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Wallet snapshot + actions */}
        <Card>
          <CardHeader
            title="Wallet Snapshot"
            icon={<FaWallet className="text-emerald-600" />}
            right={
              <div className="flex gap-2">
                <button onClick={fetchWallet} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm hover:bg-emerald-100">
                  Refresh Wallet
                </button>
                <button onClick={fetchOutstanding} className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm hover:bg-teal-100">
                  Refresh Outstanding
                </button>
                <button onClick={fetchHistory} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-100">
                  Refresh History
                </button>
              </div>
            }
          />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Balance</p>
                    <p className="text-3xl font-bold mt-2">LKR {wallet.toFixed(2)}</p>
                  </div>
                  <FaWallet className="text-4xl opacity-90" />
                </div>
              </div>
              <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-green-600 to-green-700 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Income</p>
                    <p className="text-3xl font-bold mt-2">LKR {totalIncome.toFixed(2)}</p>
                  </div>
                  <FaMoneyBillWave className="text-4xl opacity-90" />
                </div>
              </div>
              <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Payments</p>
                    <p className="text-3xl font-bold mt-2">LKR {totalPayments.toFixed(2)}</p>
                  </div>
                  <FaCreditCard className="text-4xl opacity-90" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* History */}
        <Card>
          <CardHeader title="Transaction History" icon={<FaHistory className="text-indigo-600" />} right={
            <div className="text-sm text-gray-500">Showing {history.length} record{history.length !== 1 ? 's' : ''}</div>
          } />
          <CardBody>
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No transactions yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {history.map((p) => {
                  const isIncome = String(p.type).toLowerCase() === 'income';
                  const status = String(p.status || '').toUpperCase();
                  const chip =
                    status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
                    status === 'FAILED' ? 'text-rose-700 bg-rose-100' : 'text-yellow-700 bg-yellow-100';
                  return (
                    <div key={p.id || `${p.createdAt}-${p.amount}`} className="p-4 rounded-xl border border-gray-200 hover:shadow-sm transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                          {isIncome ? <FaMoneyBillWave /> : <FaCreditCard />}
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${chip}`}>{status || 'PENDING'}</div>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">{p.paymentMethod || (isIncome ? 'Credit' : 'Payment')}</div>
                      <div className={`font-bold mt-1 ${isIncome ? 'text-green-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'} LKR {Math.abs(p.amount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}