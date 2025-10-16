import React, { useState, useEffect } from 'react';

const API = 'http://localhost:8080';

// Helper: always append residentId if provided; also send JWT if available
const authFetch = async (
  path,
  { method = 'GET', body, headers = {}, userId, includeJson = true } = {}
) => {
  const token = localStorage.getItem('authToken');
  let url = `${API}${path}`;

  // Always include residentId when caller provides userId (works for dev + prod)
  if (userId && !url.includes('residentId=')) {
    url += (url.includes('?') ? '&' : '?') + `residentId=${encodeURIComponent(userId)}`;
  }

  const finalHeaders = {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  return fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    ...(body ? { body: includeJson ? JSON.stringify(body) : body } : {})
  });
};

const Wallet = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [availableWaste, setAvailableWaste] = useState([]);
  const [sellRequests, setSellRequests] = useState([]);
  const [wasteType, setWasteType] = useState('');
  const [wasteAmount, setWasteAmount] = useState('');
  const [userId] = useState('user123'); // replace with auth context in prod
  const [loading, setLoading] = useState(false);
  const [outstanding, setOutstanding] = useState(0);
  const [cardToken, setCardToken] = useState('');

  useEffect(() => {
    fetchWalletBalance();
    fetchAvailableWaste();
    fetchOutstanding();
    fetchMySellRequests();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      // either shape works; this calls /api/payments/wallet?residentId=...
      const res = await authFetch(`/api/payments/wallet`, { userId }, userId);
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(Number(data.balance || 0));
      } else {
        console.error('wallet →', res.status, await res.text());
        setWalletBalance(0);
      }
    } catch (e) {
      console.error('Error fetching wallet balance:', e);
      setWalletBalance(0);
    }
  };
  
  const fetchOutstanding = async () => {
    try {
      const res = await authFetch(`/api/payments/outstanding`, { userId }, userId);
      if (res.ok) {
        const data = await res.json();
        setOutstanding(Number(data.outstanding || 0));
      }
    } catch (e) {
      console.error('outstanding →', e);
    }
  };
  
  const fetchMySellRequests = async () => {
    try {
      const res = await authFetch(`/api/trade/sell-requests`, { userId }, userId);
      if (res.ok) setSellRequests(await res.json());
    } catch (e) {
      console.error('sell-requests →', e);
    }
  };

  const fetchAvailableWaste = async () => {
    try {
      const res = await authFetch(`/api/trade/available`, { userId });
      if (res.ok) {
        const data = await res.json();
        setAvailableWaste(data || []);
        if (data && data.length > 0) setWasteType(data[0].type);
      } else {
        console.error('available →', await res.text());
      }
    } catch (e) {
      console.error('Error fetching available waste:', e);
    }
  };

  // const fetchMySellRequests = async () => {
  //   try {
  //     const res = await authFetch(`/api/trade/sell-requests`, { userId });
  //     if (res.ok) {
  //       const data = await res.json();
  //       setSellRequests(data || []);
  //     } else {
  //       console.error('sell-requests →', await res.text());
  //     }
  //   } catch (e) {
  //     console.error('Error fetching sell requests:', e);
  //   }
  // };

 

  const selected = availableWaste.find(w => w.type === wasteType);
  const unitPrice = selected ? selected.unitPriceLkr : 0;
  const maxAvailable = selected ? selected.availableKg : 0;
  const estimate = () => Math.max(0, parseFloat(wasteAmount || 0)) * unitPrice;

  const handleSellWaste = async () => {
    const qty = parseFloat(wasteAmount);
    if (!qty || qty <= 0) return alert('Enter a valid amount');
    if (qty > maxAvailable) return alert(`Max available: ${maxAvailable.toFixed(2)} kg`);

    setLoading(true);
    try {
      const res = await authFetch(`/api/trade/sell-requests`, {
        method: 'POST',
        body: { type: wasteType, quantityKg: qty },
        userId
      });
      if (res.ok) {
        alert('Sell request submitted — pending admin approval.');
        setWasteAmount('');
        await Promise.all([fetchAvailableWaste(), fetchMySellRequests()]);
      } else {
        alert(await res.text());
      }
    } catch (e) {
      console.error('Error submitting sell request:', e);
      alert('Failed to submit sell request.');
    } finally {
      setLoading(false);
    }
  };

  const pay = async (method) => {
    if (outstanding <= 0) return alert('No outstanding balance');
    try {
      const res = await authFetch(`/api/payments/settle`, {
        method: 'POST',
        body: { amount: outstanding, method, cardToken: method === 'CARD' ? cardToken : undefined },
        userId
      });
      if (res.ok) {
        const data = await res.json();
        setOutstanding(data.remaining || 0);
        await fetchWalletBalance();
        alert(method === 'WALLET' ? 'Paid with wallet' : 'Card payment successful');
      } else {
        alert(await res.text());
      }
    } catch (e) {
      console.error('Error settling payment:', e);
      alert('Payment failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet + Available + Outstanding */}
          <div className="space-y-6">
            {/* Wallet */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Wallet</h2>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 text-sm">Current Balance</p>
                    <p className="text-4xl font-bold mt-2">LKR {walletBalance.toFixed(2)}</p>
                    <p className="text-green-100 text-xs mt-2">Available for payments</p>
                  </div>
                  <div className="text-5xl">💼</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={fetchWalletBalance}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  🔄 Refresh Balance
                </button>
              </div>
            </div>

            {/* Available waste */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Available Waste</h2>
              <div className="space-y-3">
                {availableWaste.map(w => (
                  <div key={w.type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{w.type}</div>
                    <div className="text-sm text-gray-600">{w.availableKg.toFixed(2)} kg</div>
                    <div className="text-green-600 font-semibold">LKR {w.unitPriceLkr}/kg</div>
                  </div>
                ))}
                {availableWaste.length === 0 && <p className="text-sm text-gray-500">No available waste yet.</p>}
              </div>
            </div>

            {/* Outstanding */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Charges</h2>
              <div className="text-2xl font-bold">LKR {outstanding.toFixed(2)}</div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => pay('WALLET')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  disabled={outstanding <= 0}
                >
                  Pay with Wallet
                </button>
                <input
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  placeholder="Card token"
                  value={cardToken}
                  onChange={e => setCardToken(e.target.value)}
                />
                <button
                  onClick={() => pay('CARD')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  disabled={outstanding <= 0}
                >
                  Pay with Card
                </button>
              </div>
            </div> */}
          </div>

          {/* Sell form + My Requests */}
          <div className="space-y-6">
            {/* Sell form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sell Your Waste</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
                  <select
                    value={wasteType}
                    onChange={e => setWasteType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {availableWaste.map(w => (
                      <option key={w.type} value={w.type}>
                        {w.type} - LKR {w.unitPriceLkr}/kg
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder={`Max ${maxAvailable.toFixed(2)} kg`}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={wasteAmount}
                    onChange={e => setWasteAmount(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Available: {maxAvailable.toFixed(2)} kg</p>
                </div>
                {wasteAmount && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-green-800 font-semibold text-sm">Estimated Value after Collection</p>
                        <p className="text-green-600 text-xs">Wallet is credited when admin confirms collection.</p>
                      </div>
                      <div className="text-green-600 font-bold text-lg">LKR {estimate().toFixed(2)}</div>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleSellWaste}
                  disabled={!wasteAmount || parseFloat(wasteAmount) <= 0 || !wasteType || loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold text-base"
                >
                  {loading ? 'Submitting...' : 'Request Pickup'}
                </button>
              </div>
            </div>

            {/* My requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Sell Requests</h2>
              <div className="space-y-3">
                {sellRequests.map(r => (
                  <div key={r.id} className="p-3 rounded-lg border bg-gray-50 flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-medium">{r.type} • {r.quantityKg.toFixed(2)} kg</div>
                      <div className="text-gray-600">Status: {r.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">LKR {r.unitPriceLkr}/kg</div>
                      {r.status === 'COLLECTED' && (
                        <div className="text-emerald-700 font-semibold">
                          + LKR {r.creditedAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sellRequests.length === 0 && <p className="text-sm text-gray-500">No requests yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;