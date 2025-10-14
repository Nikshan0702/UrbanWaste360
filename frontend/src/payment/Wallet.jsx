import React, { useState, useEffect } from 'react';

const Wallet = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [wasteAmount, setWasteAmount] = useState('');
  const [wasteType, setWasteType] = useState('plastic');
  const [userId] = useState('user123'); // You can get this from auth context
  const [loading, setLoading] = useState(false);

  const wasteTypes = [
    { value: 'plastic', label: 'Plastic', price: 50 },
    { value: 'paper', label: 'Paper', price: 30 },
    { value: 'metal', label: 'Metal', price: 80 },
    { value: 'glass', label: 'Glass', price: 40 },
    { value: 'organic', label: 'Organic', price: 20 }
  ];

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/payments/wallet/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleSellWaste = async () => {
    if (!wasteAmount || parseFloat(wasteAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/waste/sell/${userId}?amount=${wasteAmount}&wasteType=${wasteType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Waste sold successfully! Added LKR ${wasteAmount} to your wallet.`);
        
        // Refresh wallet balance
        await fetchWalletBalance();
        
        // Reset form
        setWasteAmount('');
      } else {
        const error = await response.text();
        alert(`Failed to sell waste: ${error}`);
      }
    } catch (error) {
      console.error('Error selling waste:', error);
      alert('Failed to sell waste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedValue = () => {
    const selectedWaste = wasteTypes.find(w => w.value === wasteType);
    return selectedWaste ? parseFloat(wasteAmount || 0) * selectedWaste.price : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Waste Management</h1>
          <p className="text-gray-600 mt-1 text-sm">Sell your waste and earn money</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Wallet Balance */}
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Wallet</h2>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 text-sm">Current Balance</p>
                    <p className="text-4xl font-bold mt-2">LKR {walletBalance.toFixed(2)}</p>
                    <p className="text-green-100 text-xs mt-2">
                      Available for payments
                    </p>
                  </div>
                  <div className="text-5xl">💼</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={fetchWalletBalance}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  🔄 Refresh Balance
                </button>
              </div>
            </div>

            {/* Waste Types Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Waste Types & Prices</h2>
              <div className="space-y-3">
                {wasteTypes.map((waste) => (
                  <div key={waste.value} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {waste.value === 'plastic' ? '♻️' : 
                         waste.value === 'paper' ? '📄' :
                         waste.value === 'metal' ? '🔧' :
                         waste.value === 'glass' ? '🍶' : '🌱'}
                      </span>
                      <span className="font-medium text-gray-900">{waste.label}</span>
                    </div>
                    <span className="text-green-600 font-semibold">LKR {waste.price}/kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Sell Waste Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sell Your Waste</h2>
            
            <div className="space-y-4">
              {/* Waste Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Type
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {wasteTypes.map((waste) => (
                    <option key={waste.value} value={waste.value}>
                      {waste.label} - LKR {waste.price}/kg
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Enter amount in kg"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={wasteAmount}
                  onChange={(e) => setWasteAmount(e.target.value)}
                />
              </div>

              {/* Estimated Value */}
              {wasteAmount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-800 font-semibold text-sm">Estimated Value</p>
                      <p className="text-green-600 text-xs">
                        Based on current market rates
                      </p>
                    </div>
                    <div className="text-green-600 font-bold text-lg">
                      LKR {calculateEstimatedValue().toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Sell Button */}
              <button
                onClick={handleSellWaste}
                disabled={!wasteAmount || parseFloat(wasteAmount) <= 0 || loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 mt-6 shadow-sm"
              >
                {loading ? 'Processing...' : `Sell Waste - LKR ${calculateEstimatedValue().toFixed(2)}`}
              </button>

              {/* Info Note */}
              <div className="text-center mt-4">
                <p className="text-gray-500 text-xs flex items-center justify-center">
                  <span className="text-green-500 mr-1">ℹ️</span>
                  Money will be added to your wallet immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
