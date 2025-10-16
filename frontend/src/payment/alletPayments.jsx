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


import React, { useEffect, useMemo, useState } from 'react';
import {
  FaWallet,
  FaMoneyBillWave,
  FaCreditCard,
  FaHistory,
  FaShieldAlt,
  FaCheckCircle,
} from 'react-icons/fa';

const API = 'http://localhost:8080';

const isDevToken = (t) => !t || t === 'demo-token' || t === 'null' || t === 'undefined';

const authFetch = async (path, options = {}, userId) => {
  const token = localStorage.getItem('authToken');
  let url = `${API}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && !isDevToken(token) ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Dev fallback
  if (isDevToken(token) && userId && !url.includes('residentId=')) {
    url += (url.includes('?') ? '&' : '?') + `residentId=${encodeURIComponent(userId)}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 400 && isDevToken(token) && userId && !url.includes('residentId=')) {
    const retryUrl = url + (url.includes('?') ? '&' : '?') + `residentId=${encodeURIComponent(userId)}`;
    return fetch(retryUrl, { ...options, headers });
  }
  return res;
};

const WalletPayments = () => {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('WALLET'); // WALLET | CARD
  const [loading, setLoading] = useState(false);

  const [card, setCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
  });

  // Load user data
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchWallet();
      fetchOutstanding();
      fetchHistory();
    }
  }, [user]);

  const fetchWallet = async () => {
    const res = await authFetch(`/api/payments/wallet/${user.id}`, {}, user.id);
    if (res.ok) {
      const data = await res.json();
      setWalletBalance(data.balance || 0);
    }
  };

  const fetchOutstanding = async () => {
    const res = await authFetch('/api/payments/outstanding', {}, user.id);
    if (res.ok) {
      const data = await res.json();
      setOutstanding(data.outstanding || 0);
    }
  };

  const fetchHistory = async () => {
    const res = await authFetch(`/api/payments/history/${user.id}`, {}, user.id);
    if (res.ok) {
      setPaymentHistory(await res.json());
    }
  };

  const totalIncome = useMemo(
    () => paymentHistory.filter(p => p.type === 'income').reduce((sum, p) => sum + (p.amount || 0), 0),
    [paymentHistory]
  );
  const totalPayments = useMemo(
    () => paymentHistory.filter(p => p.type === 'payment').reduce((sum, p) => sum + (p.amount || 0), 0),
    [paymentHistory]
  );

  const handlePayment = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Please enter a valid amount');

    if (method === 'WALLET' && amt > walletBalance)
      return alert('Insufficient wallet balance');

    if (
      method === 'CARD' &&
      (!card.cardNumber || !card.expiryDate || !card.cvv || !card.cardHolder)
    )
      return alert('Please fill in all card details');

    setLoading(true);
    try {
      const body = {
        userId: user.id,
        amount: amt,
        paymentMethod: method,
        cardDetails: method === 'CARD' ? card : null,
      };

      const res = await authFetch('/api/payments/settle', {
        method: 'POST',
        body: JSON.stringify(body),
      }, user.id);

      if (res.ok) {
        alert('Payment successful!');
        setAmount('');
        setCard({ cardNumber: '', expiryDate: '', cvv: '', cardHolder: '' });
        fetchWallet();
        fetchOutstanding();
        fetchHistory();
      } else {
        const err = await res.text();
        alert(err || 'Payment failed.');
      }
    } catch (e) {
      alert('Payment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-600">
        Please log in to access wallet and payment features.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Wallet & Payments
        </h1>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow">
            <p className="text-emerald-100 text-sm">Wallet Balance</p>
            <p className="text-3xl font-bold mt-2">LKR {walletBalance.toFixed(2)}</p>
            <p className="text-emerald-100 text-xs mt-1">Available for payments</p>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-2xl shadow">
            <p className="text-green-100 text-sm">Total Income</p>
            <p className="text-3xl font-bold mt-2">LKR {totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow">
            <p className="text-indigo-100 text-sm">Total Payments</p>
            <p className="text-3xl font-bold mt-2">LKR {totalPayments.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment and Wallet section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Make Payment</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (LKR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 ${
                  method === 'WALLET'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => setMethod('WALLET')}
              >
                <FaWallet /> Wallet
              </button>
              <button
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 ${
                  method === 'CARD'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => setMethod('CARD')}
              >
                <FaCreditCard /> Card
              </button>
            </div>

            {/* Card Fields */}
            {method === 'CARD' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={card.cardNumber}
                  onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Expiry (MM/YY)"
                    value={card.expiryDate}
                    onChange={(e) => setCard({ ...card, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Card Holder Name"
                  value={card.cardHolder}
                  onChange={(e) => setCard({ ...card, cardHolder: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg mt-5 hover:bg-emerald-700"
            >
              {loading ? 'Processing...' : `Pay LKR ${amount || '0.00'}`}
            </button>
          </div>

          {/* Wallet Info */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Wallet Overview</h2>
            <div className="bg-emerald-100 p-4 rounded-lg mb-4">
              <p className="text-emerald-800 font-semibold">
                Outstanding: LKR {outstanding.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => {
                fetchWallet();
                fetchOutstanding();
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
            >
              Refresh Balances
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          {paymentHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No transactions found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paymentHistory.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {p.paymentMethod}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        p.status === 'COMPLETED'
                          ? 'text-green-600'
                          : p.status === 'FAILED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-gray-700">
                    Amount: LKR {p.amount?.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPayments;