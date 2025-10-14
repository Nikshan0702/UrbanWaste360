import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


    const [selectedMethod, setSelectedMethod] = useState('wallet');
    const [walletBalance, setWalletBalance] = useState(1250.75);
    const [totalAmount, setTotalAmount] = useState(899.99);
    const [cardDetails, setCardDetails] = useState({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolder: ''
    });
  
    const paymentMethods = [
      { id: 'wallet', name: 'Wallet Balance'},
      { id: 'card', name: 'Credit/Debit Card'},
    ];
  

  // Debug: Check what's in localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    console.log('🔍 DEBUG - LocalStorage Contents:');
    console.log('Auth Token:', token);
    console.log('Stored User Data:', storedUserData);
    
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        console.log('Parsed User Data:', parsedData);
        setUserData(parsedData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('🔑 Using token:', token);

      // Try the main profile endpoint
      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Profile response status:', response.status);

      if (response.ok) {
        const userDataFromAPI = await response.json();
        console.log('✅ User data from API:', userDataFromAPI);
        setUserData(userDataFromAPI);
        setError('');
      } else {
        const errorText = await response.text();
        console.error('❌ Profile endpoint error:', errorText);
        setError(`Server error: ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError('');
    fetchUserData();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };


  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = () => {
    alert(`Payment processing with ${selectedMethod}`);
  };
  // Simple dashboard using stored data
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      );
    }

    // Use stored data if API fails
    const displayData = userData || JSON.parse(localStorage.getItem('userData') || 'null');

    if (!displayData) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">{error || 'Please login to access your dashboard'}</p>
            <div className="space-x-4">
              <button 
                onClick={handleRetry}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              >
                Try Again
              </button>
              <button 
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome back, {displayData.name || 'User'}!
              </h1>
              <p className="text-gray-600">Smart Waste Management Dashboard</p>
              {error && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-700 text-sm">
                    Note: Using stored data. {error}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-lg font-semibold">{displayData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-lg font-semibold">{displayData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-lg font-semibold">{displayData.number || displayData.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-lg font-semibold">{displayData.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-lg font-semibold">{displayData.name}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-lg font-semibold">{displayData.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-lg font-semibold">{displayData.number || displayData.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-lg font-semibold">{displayData.role || 'USER'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className="p-3 bg-gray-50 rounded border min-h-[60px]">
                  <p className="text-lg font-semibold">{displayData.address || 'Not provided'}</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-700">
                    <strong>Note:</strong> {error}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        );
        
        case 'payments':
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
                          <p className="text-3xl font-bold mt-2">{walletBalance.toFixed(2)}</p>
                          <p className="text-green-100 text-xs mt-2">
                            After payment: {(walletBalance - totalAmount).toFixed(2)}
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">{totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">0.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">89.99</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-3 border-t border-gray-100">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-green-600">{totalAmount.toFixed(2)}</span>
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 mt-6 shadow-sm"
                  >
                    Pay {totalAmount.toFixed(2)}
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







      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">This section is coming soon.</p>
              <p className="text-sm text-gray-400 mt-2">
                Welcome, {displayData.name}! Your profile is loaded from {userData ? 'API' : 'local storage'}.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">UrbanWaste360</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {userData ? `Hi, ${userData.name}` : 'Using stored data'}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 bg-white rounded-lg shadow p-4">
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard'},
                { id: 'waste-history', label: 'Waste History' },
                { id: 'recycling-credit', label: 'Recycling Credit' },
                { id: 'reports', label: 'Reports' },
                { id: 'payments', label: 'Payments' },
                { id: 'schedule', label: 'Schedule'},
                { id: 'profile', label: 'Profile' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;