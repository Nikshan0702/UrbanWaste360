import React, { useState, useEffect } from 'react';

const PaymentDetailsPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const [userId, setUserId] = useState('user123'); // You can get this from auth context

  const paymentMethods = [
    { id: 'wallet', name: 'Wallet Balance', icon: '💼' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
  ];

  // Fetch wallet balance on component mount
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

  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = async () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (selectedMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.cardHolder)) {
      alert('Please fill in all card details');
      return;
    }

    try {
      const paymentData = {
        userId: userId,
        amount: parseFloat(totalAmount),
        paymentMethod: selectedMethod.toUpperCase(),
        cardDetails: selectedMethod === 'card' ? cardDetails : null
      };

      const response = await fetch('http://localhost:8080/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Payment successful! Payment ID: ${result.paymentId}`);
        
        // Refresh wallet balance
        await fetchWalletBalance();
        
        // Reset form
        setTotalAmount('');
        setCardDetails({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolder: ''
        });
      } else {
        const error = await response.text();
        alert(`Payment failed: ${error}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-gray-600 mt-1 text-sm">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Balance & Order Summary */}
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Balance</h2>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-5 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 text-sm">Available Balance</p>
                    <p className="text-3xl font-bold mt-2">LKR {walletBalance.toFixed(2)}</p>
                    <p className="text-green-100 text-xs mt-2">
                      After payment: LKR {(walletBalance - (totalAmount ? parseFloat(totalAmount) : 0)).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-4xl">💼</div>
                </div>
              </div>
              
              {selectedMethod === 'wallet' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-semibold text-sm">Sufficient Balance</p>
                      <p className="text-green-600 text-xs">
                        You have enough funds to complete this payment
                      </p>
                    </div>
                    <div className="text-green-500 text-xl">✓</div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Amount</h2>
              
              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter amount to pay"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="text-gray-900">LKR 0.00</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-3 border-t border-gray-100">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-green-600">
                    LKR {totalAmount ? parseFloat(totalAmount).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 border rounded-lg transition-all duration-200 text-left ${
                    selectedMethod === method.id
                      ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === method.id ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <span className="text-xl">{method.icon}</span>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{method.name}</span>
                    {selectedMethod === method.id && (
                      <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Method Details */}
            {selectedMethod === 'card' && (
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-lg font-semibold">Credit Card</div>
                    <div className="text-2xl">💳</div>
                  </div>
                  <div className="text-lg font-mono tracking-wider mb-4">
                    {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-gray-400">Card Holder</p>
                      <p className="font-semibold">{cardDetails.cardHolder || 'Your Name'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expires</p>
                      <p className="font-semibold">{cardDetails.expiryDate || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={cardDetails.expiryDate}
                        onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={cardDetails.cardHolder}
                      onChange={(e) => handleCardInputChange('cardHolder', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={!totalAmount || parseFloat(totalAmount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 mt-6 shadow-sm"
            >
              Pay LKR {totalAmount ? parseFloat(totalAmount).toFixed(2) : '0.00'}
            </button>

            {/* Security Note */}
            <div className="text-center mt-4">
              <p className="text-gray-500 text-xs flex items-center justify-center">
                <span className="text-green-500 mr-1">🔒</span>
                Your payment is secure and encrypted
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>By completing this purchase, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;