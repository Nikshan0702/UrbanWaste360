import React, { useState, useEffect } from 'react';
import { 
  FaWallet, 
  FaMoneyBillWave, 
  FaCreditCard, 
  FaHistory, 
  FaRecycle, 
  FaTrash, 
  FaPaperPlane, 
  FaCog, 
  FaUser, 
  FaSignOutAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaChartLine,
  FaCalendarAlt,
  FaFileAlt,
  FaExclamationTriangle, 
  FaCamera, 
  FaMapMarkerAlt,
  FaPaperclip,
  FaCheck,
  FaEye,
  FaComment
} from 'react-icons/fa';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  
  // Waste selling state
  const [wasteAmount, setWasteAmount] = useState('');
  const [wasteType, setWasteType] = useState('plastic');
  const [wasteLoading, setWasteLoading] = useState(false);
  
  // Feedback & Issues state
  const [feedbackTab, setFeedbackTab] = useState('report');
  const [issueCategory, setIssueCategory] = useState('missed_pickup');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [issuePhotos, setIssuePhotos] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [useGPSLocation, setUseGPSLocation] = useState(false);
  const [submittedIssues, setSubmittedIssues] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [userId, setUserId] = useState('');

  const paymentMethods = [
    { 
      id: 'wallet', 
      name: 'Wallet Balance', 
      icon: FaWallet
    },
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: FaCreditCard
    }
  ];
  
  const issueCategories = [
    { id: 'missed_pickup', name: 'Missed Pickup', icon: FaExclamationTriangle, color: 'red' },
    { id: 'broken_bin', name: 'Broken/Damaged Bin', icon: FaTrash, color: 'orange' },
    { id: 'overflow', name: 'Bin Overflow', icon: FaRecycle, color: 'yellow' },
    { id: 'complaint', name: 'Complaint', icon: FaComment, color: 'blue' },
    { id: 'suggestion', name: 'Suggestion', icon: FaPaperclip, color: 'green' }
  ];

  const issueStatuses = {
    pending: { label: 'Pending', color: 'yellow', icon: FaClock },
    in_progress: { label: 'In Progress', color: 'blue', icon: FaEye },
    resolved: { label: 'Resolved', color: 'green', icon: FaCheck }
  };

  // Color utility functions
  const getColorClasses = (color) => {
    const colorMap = {
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-500',
        bgLight: 'bg-red-50'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-500',
        bgLight: 'bg-orange-50'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-500',
        bgLight: 'bg-yellow-50'
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-500',
        bgLight: 'bg-blue-50'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-500',
        bgLight: 'bg-green-50'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const getStatusColorClasses = (status) => {
    const statusMap = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      },
      in_progress: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      },
      resolved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  // Fetch submitted issues from backend
  const fetchSubmittedIssues = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData?.id) {
        console.log('No user ID found');
        return;
      }

      console.log('Fetching issues for user:', userData.id);

      const response = await fetch(`http://localhost:8080/api/issues/user/${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Issues response status:', response.status);

      if (response.ok) {
        const issues = await response.json();
        console.log('Fetched issues:', issues);
        
        // Transform the backend data to match your frontend structure
        const formattedIssues = issues.map(issue => ({
          id: issue.id || issue._id,
          category: issue.category,
          description: issue.description,
          location: issue.location,
          isAnonymous: issue.isAnonymous || false,
          photos: issue.photoUrls ? issue.photoUrls.map(url => ({ 
            id: Date.now() + Math.random(),
            preview: url 
          })) : [],
          timestamp: issue.createdAt || issue.timestamp,
          status: issue.status || 'pending'
        }));
        
        setSubmittedIssues(formattedIssues);
      } else {
        console.error('Failed to fetch issues:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching submitted issues:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch issues when component loads or when switching to history tab
  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchSubmittedIssues();
    }
  }, [activeTab]);

  useEffect(() => {
    if (feedbackTab === 'history') {
      fetchSubmittedIssues();
    }
  }, [feedbackTab]);

  // Feedback & Issue functions
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + issuePhotos.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setIssuePhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id) => {
    setIssuePhotos(prev => prev.filter(photo => {
      if (photo.id === id) {
        URL.revokeObjectURL(photo.preview);
      }
      return photo.id !== id;
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setUseGPSLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIssueLocation(`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location');
        setUseGPSLocation(false);
      }
    );
  };

  const handleSubmitIssue = async () => {
    if (!issueDescription.trim()) {
      alert('Please provide a description of the issue');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData?.id) {
        alert('User not found. Please login again.');
        return;
      }

      const issueData = {
        userId: userData.id,
        category: issueCategory,
        description: issueDescription,
        location: issueLocation,
        isAnonymous: isAnonymous,
        useGPSLocation: useGPSLocation,
        status: 'pending'
      };

      // Send to backend API
      const response = await fetch('http://localhost:8080/api/issues/report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refresh the issues list to include the new one
        await fetchSubmittedIssues();
        
        resetForm();
        alert('Issue reported successfully! You will receive updates on the status.');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit issue');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      
      // Fallback: Save locally if API fails
      const localIssue = {
        id: Date.now().toString(),
        category: issueCategory,
        description: issueDescription,
        location: issueLocation,
        isAnonymous: isAnonymous,
        photos: [...issuePhotos],
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      setSubmittedIssues(prev => [localIssue, ...prev]);
      resetForm();
      alert('Issue reported locally. It will be synced when connection is restored.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIssueCategory('missed_pickup');
    setIssueDescription('');
    setIssueLocation('');
    setIssuePhotos([]);
    setIsAnonymous(false);
    setUseGPSLocation(false);
  };

  // Payment and wallet functions
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData?.id) return;

      const response = await fetch(`http://localhost:8080/api/payments/wallet/${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const walletData = await response.json();
        setWalletBalance(walletData.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData?.id) return;

      const response = await fetch(`http://localhost:8080/api/payments/history/${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const history = await response.json();
        setPaymentHistory(history);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
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
        
        // Refresh wallet balance and payment history
        await fetchWalletBalance();
        await fetchPaymentHistory();
        
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

  // Waste selling functions
  const handleSellWaste = async () => {
    if (!wasteAmount || parseFloat(wasteAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setWasteLoading(true);
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
        
        // Refresh wallet balance and payment history
        await fetchWalletBalance();
        await fetchPaymentHistory();
        
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
      setWasteLoading(false);
    }
  };

  const calculateEstimatedValue = () => {
    const wasteTypes = [
      { value: 'plastic', price: 50 },
      { value: 'paper', price: 30 },
      { value: 'metal', price: 80 },
      { value: 'glass', price: 40 },
      { value: 'organic', price: 20 }
    ];
    const selectedWaste = wasteTypes.find(w => w.value === wasteType);
    return selectedWaste ? parseFloat(wasteAmount || 0) * selectedWaste.price : 0;
  };

  // User data functions
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
      console.log('📡 Fetching user profile...');
      
      // Try to get user from localStorage first
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          console.log('✅ Using stored user data:', parsedData);
          setUserData(parsedData);
          setUserId(parsedData.id || parsedData.email);
          setLoading(false);
          return;
        } catch (e) {
          console.error('❌ Error parsing stored user data:', e);
        }
      }

      // If no stored data, fetch from API
      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Profile response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Profile data received:', userData);
        setUserData(userData);
        setUserId(userData.id || userData.email);
        
        // Store in localStorage for future use
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        const errorText = await response.text();
        console.error('❌ Profile endpoint error:', errorText);
        setError('Failed to load user profile: ' + errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setError('Failed to connect to server');
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

  // Calculate totals
  const totalIncome = paymentHistory
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPayments = paymentHistory
    .filter(item => item.type === 'payment')
    .reduce((sum, item) => sum + item.amount, 0);

  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      );
    }

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
          <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Wallet Balance</p>
                      <p className="text-3xl font-bold mt-2">LKR {walletBalance.toFixed(2)}</p>
                      <p className="text-blue-100 text-xs mt-2">Available for payments</p>
                    </div>
                    <div className="text-4xl text-blue-200">
                      <FaWallet />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Income</p>
                      <p className="text-3xl font-bold mt-2">LKR {totalIncome.toFixed(2)}</p>
                      <p className="text-green-100 text-xs mt-2">From waste sales</p>
                    </div>
                    <div className="text-4xl text-green-200">
                      <FaMoneyBillWave />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Payments</p>
                      <p className="text-3xl font-bold mt-2">LKR {totalPayments.toFixed(2)}</p>
                      <p className="text-purple-100 text-xs mt-2">Service fees paid</p>
                    </div>
                    <div className="text-4xl text-purple-200">
                      <FaCreditCard />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Waste Selling */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FaRecycle className="text-green-600" />
                      Sell Your Waste
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Waste Type
                        </label>
                        <select
                          value={wasteType}
                          onChange={(e) => setWasteType(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="plastic">Plastic - LKR 50/kg</option>
                          <option value="paper">Paper - LKR 30/kg</option>
                          <option value="metal">Metal - LKR 80/kg</option>
                          <option value="glass">Glass - LKR 40/kg</option>
                          <option value="organic">Organic - LKR 20/kg</option>
                        </select>
                      </div>

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

                      <button
                        onClick={handleSellWaste}
                        disabled={!wasteAmount || parseFloat(wasteAmount) <= 0 || wasteLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 mt-6 shadow-sm flex items-center justify-center gap-2"
                      >
                        <FaRecycle className="w-4 h-4" />
                        {wasteLoading ? 'Processing...' : `Sell Waste - LKR ${calculateEstimatedValue().toFixed(2)}`}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Processing */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FaCreditCard className="text-blue-600" />
                      Make Payment
                    </h2>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaWallet className="text-blue-600" />
                          <span className="font-semibold text-blue-800">Current Balance</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          LKR {walletBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Amount (LKR)
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

                    <div className="space-y-3 mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Select Payment Method</h3>
                      {paymentMethods.map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${
                              selectedMethod === method.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-lg text-xl ${
                                selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <IconComponent />
                              </div>
                              <div className="flex-1">
                                <span className="font-semibold text-gray-900">{method.name}</span>
                                {method.id === 'wallet' && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Available: LKR {walletBalance.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              {selectedMethod === method.id && (
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <FaCheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedMethod === 'card' && (
                      <div className="space-y-4 border-t border-gray-200 pt-6">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 text-white">
                          <div className="flex justify-between items-start mb-6">
                            <div className="text-lg font-bold">Credit Card</div>
                            <div className="text-2xl">💳</div>
                          </div>
                          <div className="text-xl font-mono tracking-wider mb-6">
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

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Number
                            </label>
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                              value={cardDetails.cardNumber}
                              onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                value={cardDetails.expiryDate}
                                onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV
                              </label>
                              <input
                                type="text"
                                placeholder="123"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                value={cardDetails.cvv}
                                onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Holder Name
                            </label>
                            <input
                              type="text"
                              placeholder="John Doe"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                              value={cardDetails.cardHolder}
                              onChange={(e) => handleCardInputChange('cardHolder', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handlePayment}
                      disabled={!totalAmount || parseFloat(totalAmount) <= 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 mt-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <FaCreditCard className="w-5 h-5" />
                      Pay LKR {totalAmount ? parseFloat(totalAmount).toFixed(2) : '0.00'}
                    </button>

                    <div className="text-center mt-4">
                      <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                        <FaShieldAlt className="text-blue-500" />
                        Your payment is secure and encrypted
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaHistory className="text-purple-600" />
                        Transaction History
                      </h2>
                      <button
                        onClick={fetchPaymentHistory}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        Refresh
                      </button>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {paymentHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <FaFileAlt className="text-4xl text-gray-400 mb-2 mx-auto" />
                          <p className="text-gray-500 text-sm">No transactions yet</p>
                        </div>
                      ) : (
                        paymentHistory.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                payment.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {payment.type === 'income' ? <FaMoneyBillWave className="w-5 h-5" /> : <FaCreditCard className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{payment.description}</p>
                                <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  payment.status.toLowerCase() === 'completed' ? 'text-green-600 bg-green-100' :
                                  payment.status.toLowerCase() === 'failed' ? 'text-red-600 bg-red-100' :
                                  'text-yellow-600 bg-yellow-100'
                                }`}>
                                  {payment.status.toLowerCase() === 'completed' && <FaCheckCircle className="w-3 h-3 mr-1" />}
                                  {payment.status.toLowerCase() === 'failed' && <FaTimesCircle className="w-3 h-3 mr-1" />}
                                  {payment.status.toLowerCase() === 'pending' && <FaClock className="w-3 h-3 mr-1" />}
                                  {payment.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-sm ${
                                payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {payment.type === 'income' ? '+' : '-'}LKR {Math.abs(payment.amount).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Waste Disposal Feedback & Issue Reporting
                </h1>
                <p className="text-gray-600">
                  Report issues, provide feedback, and help us improve our services
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setFeedbackTab('report')}
                    className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                      feedbackTab === 'report'
                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaExclamationTriangle className="inline mr-2" />
                    Report Issue
                  </button>
                  <button
                    onClick={() => {
                      setFeedbackTab('history');
                      fetchSubmittedIssues();
                    }}
                    className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                      feedbackTab === 'history'
                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaHistory className="inline mr-2" />
                    Report History
                  </button>
                </div>

                <div className="p-6">
                  {feedbackTab === 'report' ? (
                    <div className="space-y-6">
                      {/* Issue Category */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Issue Category
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {issueCategories.map((category) => {
                            const IconComponent = category.icon;
                            const colorClasses = getColorClasses(category.color);
                            return (
                              <button
                                key={category.id}
                                onClick={() => setIssueCategory(category.id)}
                                className={`p-4 border-2 rounded-xl text-left transition-all ${
                                  issueCategory === category.id
                                    ? `${colorClasses.border} ${colorClasses.bgLight}`
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <span className="font-medium text-gray-900">{category.name}</span>
                                  {issueCategory === category.id && (
                                    <FaCheck className={`ml-auto ${colorClasses.text}`} />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={issueDescription}
                          onChange={(e) => setIssueDescription(e.target.value)}
                          placeholder="Please describe the issue in detail..."
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Location
                        </label>
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            value={issueLocation}
                            onChange={(e) => setIssueLocation(e.target.value)}
                            placeholder="Enter location or address..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          />
                          <button
                            onClick={getCurrentLocation}
                            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <FaMapMarkerAlt className="w-4 h-4" />
                            <span>Use GPS</span>
                          </button>
                        </div>
                      </div>

                      {/* Photo Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Photos (Optional)
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FaCamera className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Click to upload photos</p>
                                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                              </div>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          
                          {issuePhotos.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              {issuePhotos.map((photo) => (
                                <div key={photo.id} className="relative group">
                                  <img
                                    src={photo.preview}
                                    alt="Upload preview"
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => removePhoto(photo.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Privacy Options */}
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            Report anonymously (your personal data will be hidden)
                          </span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <div className="flex space-x-4 pt-4">
                        <button
                          onClick={resetForm}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                          Clear Form
                        </button>
                        <button
                          onClick={handleSubmitIssue}
                          disabled={!issueDescription.trim() || isSubmitting}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <FaPaperclip className="w-4 h-4" />
                              <span>Submit Report</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Report History */
                    <div className="space-y-4">
                      {historyLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                          <p className="text-gray-500 mt-2">Loading reports...</p>
                        </div>
                      ) : submittedIssues.length === 0 ? (
                        <div className="text-center py-12">
                          <FaFileAlt className="text-4xl text-gray-400 mb-3 mx-auto" />
                          <p className="text-gray-500 text-lg">No reports submitted yet</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Your reported issues will appear here
                          </p>
                        </div>
                      ) : (
                        submittedIssues.map((issue) => {
                          const category = issueCategories.find(cat => cat.id === issue.category);
                          const status = issueStatuses[issue.status];
                          const StatusIcon = status?.icon || FaClock;
                          const colorClasses = category ? getColorClasses(category.color) : getColorClasses('blue');
                          const statusClasses = getStatusColorClasses(issue.status);
                          
                          return (
                            <div key={issue.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  {category && (
                                    <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
                                      <category.icon className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {category?.name || 'Issue'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {new Date(issue.timestamp).toLocaleDateString()} • {issue.isAnonymous ? 'Anonymous' : displayData?.name}
                                    </p>
                                  </div>
                                </div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClasses.bg} ${statusClasses.text} border ${statusClasses.border}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status?.label || 'Pending'}
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{issue.description}</p>
                              
                              {issue.location && (
                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                  <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                                  {issue.location}
                                </div>
                              )}
                              
                              {issue.photos && issue.photos.length > 0 && (
                                <div className="flex space-x-2 mb-3">
                                  {issue.photos.slice(0, 3).map((photo, index) => (
                                    <img
                                      key={index}
                                      src={photo.preview}
                                      alt={`Issue photo ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                  ))}
                                  {issue.photos.length > 3 && (
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                      +{issue.photos.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Information Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <FaComment className="text-blue-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">How Issue Reporting Works</h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Reports are reviewed by our waste management team within 24 hours</li>
                      <li>• You'll receive status updates via email and in-app notifications</li>
                      <li>• Emergency issues are prioritized for immediate attention</li>
                      <li>• Your feedback helps us improve services for everyone</li>
                    </ul>
                  </div>
                </div>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">♻️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">UrbanWaste360</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">
              {userData ? `Welcome, ${userData.name}` : 'Using stored data'}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
                { id: 'waste-history', label: 'Waste History', icon: FaTrash },
                { id: 'recycling-credit', label: 'Recycling Credit', icon: FaRecycle },
                { id: 'reports', label: 'Reports', icon: FaFileAlt },
                { id: 'payments', label: 'Payments', icon: FaCreditCard },
                { id: 'schedule', label: 'Schedule', icon: FaCalendarAlt },
                { id: 'profile', label: 'Profile', icon: FaUser },
                { id: 'feedback', label: 'Feedback & Issues', icon: FaExclamationTriangle },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <IconComponent className="mr-3 text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;