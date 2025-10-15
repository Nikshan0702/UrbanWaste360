// import React, { useState, useEffect } from 'react';

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');


//     const [selectedMethod, setSelectedMethod] = useState('wallet');
//     const [walletBalance, setWalletBalance] = useState(1250.75);
//     const [totalAmount, setTotalAmount] = useState(899.99);
//     const [cardDetails, setCardDetails] = useState({
//       cardNumber: '',
//       expiryDate: '',
//       cvv: '',
//       cardHolder: ''
//     });
  
//     const paymentMethods = [
//       { id: 'wallet', name: 'Wallet Balance'},
//       { id: 'card', name: 'Credit/Debit Card'},
//     ];
  

//   // Debug: Check what's in localStorage
//   useEffect(() => {
//     const token = localStorage.getItem('authToken');
//     const storedUserData = localStorage.getItem('userData');
    
//     console.log('🔍 DEBUG - LocalStorage Contents:');
//     console.log('Auth Token:', token);
//     console.log('Stored User Data:', storedUserData);
    
//     if (storedUserData) {
//       try {
//         const parsedData = JSON.parse(storedUserData);
//         console.log('Parsed User Data:', parsedData);
//         setUserData(parsedData);
//       } catch (e) {
//         console.error('Error parsing stored user data:', e);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   const fetchUserData = async () => {
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('No authentication token found. Please login again.');
//         setLoading(false);
//         return;
//       }

//       console.log('🔑 Using token:', token);

//       // Try the main profile endpoint
//       const response = await fetch('http://localhost:8080/api/users/profile', {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('📡 Profile response status:', response.status);

//       if (response.ok) {
//         const userDataFromAPI = await response.json();
//         console.log('✅ User data from API:', userDataFromAPI);
//         setUserData(userDataFromAPI);
//         setError('');
//       } else {
//         const errorText = await response.text();
//         console.error('❌ Profile endpoint error:', errorText);
//         setError(`Server error: ${errorText}`);
//       }
//     } catch (error) {
//       console.error('💥 Network error:', error);
//       setError('Network error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRetry = () => {
//     setLoading(true);
//     setError('');
//     fetchUserData();
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userData');
//     window.location.href = '/';
//   };


//   const handleCardInputChange = (field, value) => {
//     setCardDetails(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handlePayment = () => {
//     alert(`Payment processing with ${selectedMethod}`);
//   };
//   // Simple dashboard using stored data
//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
//           <span className="ml-3 text-gray-600">Loading...</span>
//         </div>
//       );
//     }

//     // Use stored data if API fails
//     const displayData = userData || JSON.parse(localStorage.getItem('userData') || 'null');

//     if (!displayData) {
//       return (
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="text-center py-8">
//             <div className="text-red-500 text-4xl mb-4">🔒</div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
//             <p className="text-gray-600 mb-4">{error || 'Please login to access your dashboard'}</p>
//             <div className="space-x-4">
//               <button 
//                 onClick={handleRetry}
//                 className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
//               >
//                 Try Again
//               </button>
//               <button 
//                 onClick={handleLogout}
//                 className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     switch (activeTab) {
//       case 'dashboard':
//         return (
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow p-6">
//               <h1 className="text-2xl font-bold text-gray-800 mb-2">
//                 Welcome back, {displayData.name || 'User'}!
//               </h1>
//               <p className="text-gray-600">Smart Waste Management Dashboard</p>
//               {error && (
//                 <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
//                   <p className="text-yellow-700 text-sm">
//                     Note: Using stored data. {error}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold mb-4">Your Profile Information</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                   <p className="mt-1 text-lg font-semibold">{displayData.name}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Email</label>
//                   <p className="mt-1 text-lg font-semibold">{displayData.email}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Phone</label>
//                   <p className="mt-1 text-lg font-semibold">{displayData.number || displayData.phone || 'Not provided'}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Address</label>
//                   <p className="mt-1 text-lg font-semibold">{displayData.address || 'Not provided'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 'profile':
//         return (
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//                   <div className="p-3 bg-gray-50 rounded border">
//                     <p className="text-lg font-semibold">{displayData.name}</p>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                   <div className="p-3 bg-gray-50 rounded border">
//                     <p className="text-lg font-semibold">{displayData.email}</p>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//                   <div className="p-3 bg-gray-50 rounded border">
//                     <p className="text-lg font-semibold">{displayData.number || displayData.phone || 'Not provided'}</p>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
//                   <div className="p-3 bg-gray-50 rounded border">
//                     <p className="text-lg font-semibold">{displayData.role || 'USER'}</p>
//                   </div>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
//                 <div className="p-3 bg-gray-50 rounded border min-h-[60px]">
//                   <p className="text-lg font-semibold">{displayData.address || 'Not provided'}</p>
//                 </div>
//               </div>

//               {error && (
//                 <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
//                   <p className="text-yellow-700">
//                     <strong>Note:</strong> {error}
//                   </p>
//                 </div>
//               )}

//               <div className="pt-4 border-t">
//                 <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold">
//                   Edit Profile
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
        
//         case 'payments':
//           return (
//             <div className="min-h-screen bg-white py-6 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-4xl mx-auto">
//               {/* Header */}
//               <div className="text-center mb-8">
//                 <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
//                 <p className="text-gray-600 mt-1 text-sm">Complete your purchase securely</p>
//               </div>
      
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Left Side - Balance & Order Summary */}
//                 <div className="space-y-6">
//                   {/* Wallet Balance Card */}
//                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Balance</h2>
//                     <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-5 text-white">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <p className="text-green-100 text-sm">Available Balance</p>
//                           <p className="text-3xl font-bold mt-2">{walletBalance.toFixed(2)}</p>
//                           <p className="text-green-100 text-xs mt-2">
//                             After payment: {(walletBalance - totalAmount).toFixed(2)}
//                           </p>
//                         </div>
//                         <div className="text-4xl">💼</div>
//                       </div>
//                     </div>
                    
//                     {selectedMethod === 'wallet' && (
//                       <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-green-800 font-semibold text-sm">Sufficient Balance</p>
//                             <p className="text-green-600 text-xs">
//                               You have enough funds to complete this payment
//                             </p>
//                           </div>
//                           <div className="text-green-500 text-xl">✓</div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
      
//                   {/* Order Summary */}
//                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
//                     <div className="space-y-3">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-600">Subtotal</span>
//                         <span className="text-gray-900">{totalAmount.toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-600">Shipping</span>
//                         <span className="text-gray-900">0.00</span>
//                       </div>
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-600">Tax</span>
//                         <span className="text-gray-900">89.99</span>
//                       </div>
//                       <div className="flex justify-between text-base font-semibold pt-3 border-t border-gray-100">
//                         <span className="text-gray-900">Total Amount</span>
//                         <span className="text-green-600">{totalAmount.toFixed(2)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
      
//                 {/* Right Side - Payment Method */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  
//                   {/* Payment Methods */}
//                   <div className="space-y-3 mb-6">
//                     {paymentMethods.map((method) => (
//                       <button
//                         key={method.id}
//                         onClick={() => setSelectedMethod(method.id)}
//                         className={`w-full p-4 border rounded-lg transition-all duration-200 text-left ${
//                           selectedMethod === method.id
//                             ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500'
//                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                         }`}
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className={`p-2 rounded-lg ${
//                             selectedMethod === method.id ? 'bg-green-100' : 'bg-gray-100'
//                           }`}>
//                             <span className="text-xl">{method.icon}</span>
//                           </div>
//                           <span className="font-medium text-gray-900 text-sm">{method.name}</span>
//                           {selectedMethod === method.id && (
//                             <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
//                           )}
//                         </div>
//                       </button>
//                     ))}
//                   </div>
      
//                   {/* Payment Method Details */}
//                   {selectedMethod === 'card' && (
//                     <div className="space-y-4 border-t border-gray-100 pt-6">
//                       <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 text-white">
//                         <div className="flex justify-between items-start mb-4">
//                           <div className="text-lg font-semibold">Credit Card</div>
//                           <div className="text-2xl">💳</div>
//                         </div>
//                         <div className="text-lg font-mono tracking-wider mb-4">
//                           {cardDetails.cardNumber || '•••• •••• •••• ••••'}
//                         </div>
//                         <div className="flex justify-between items-center text-sm">
//                           <div>
//                             <p className="text-gray-400">Card Holder</p>
//                             <p className="font-semibold">{cardDetails.cardHolder || 'Your Name'}</p>
//                           </div>
//                           <div>
//                             <p className="text-gray-400">Expires</p>
//                             <p className="font-semibold">{cardDetails.expiryDate || 'MM/YY'}</p>
//                           </div>
//                         </div>
//                       </div>
      
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Card Number
//                           </label>
//                           <input
//                             type="text"
//                             placeholder="1234 5678 9012 3456"
//                             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                             value={cardDetails.cardNumber}
//                             onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
//                           />
//                         </div>
      
//                         <div className="grid grid-cols-2 gap-3">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Expiry Date
//                             </label>
//                             <input
//                               type="text"
//                               placeholder="MM/YY"
//                               className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                               value={cardDetails.expiryDate}
//                               onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               CVV
//                             </label>
//                             <input
//                               type="text"
//                               placeholder="123"
//                               className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                               value={cardDetails.cvv}
//                               onChange={(e) => handleCardInputChange('cvv', e.target.value)}
//                             />
//                           </div>
//                         </div>
      
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Card Holder Name
//                           </label>
//                           <input
//                             type="text"
//                             placeholder="John Doe"
//                             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                             value={cardDetails.cardHolder}
//                             onChange={(e) => handleCardInputChange('cardHolder', e.target.value)}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}
      
//                   {/* Pay Button */}
//                   <button
//                     onClick={handlePayment}
//                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 mt-6 shadow-sm"
//                   >
//                     Pay {totalAmount.toFixed(2)}
//                   </button>
      
//                   {/* Security Note */}
//                   <div className="text-center mt-4">
//                     <p className="text-gray-500 text-xs flex items-center justify-center">
//                       <span className="text-green-500 mr-1">🔒</span>
//                       Your payment is secure and encrypted
//                     </p>
//                   </div>
//                 </div>
//               </div>
      
//               {/* Additional Info */}
//               <div className="mt-6 text-center text-gray-500 text-xs">
//                 <p>By completing this purchase, you agree to our Terms of Service</p>
//               </div>
//             </div>
//           </div>
//           );

//       default:
//         return (
//           <div className="bg-white rounded-lg shadow p-6">
//             <h2 className="text-xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
//             <div className="text-center py-8">
//               <p className="text-gray-500">This section is coming soon.</p>
//               <p className="text-sm text-gray-400 mt-2">
//                 Welcome, {displayData.name}! Your profile is loaded from {userData ? 'API' : 'local storage'}.
//               </p>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-gray-800">UrbanWaste360</h1>
//           <div className="flex items-center space-x-4">
//             <span className="text-gray-600">
//               {userData ? `Hi, ${userData.name}` : 'Using stored data'}
//             </span>
//             <button 
//               onClick={handleLogout}
//               className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="flex flex-col md:flex-row gap-6">
//           <div className="md:w-64 bg-white rounded-lg shadow p-4">
//             <nav className="space-y-2">
//               {[
//                 { id: 'dashboard', label: 'Dashboard'},
//                 { id: 'waste-history', label: 'Waste History' },
//                 { id: 'recycling-credit', label: 'Recycling Credit' },
//                 { id: 'reports', label: 'Reports' },
//                 { id: 'payments', label: 'Payments' },
//                 { id: 'schedule', label: 'Schedule'},
//                 { id: 'profile', label: 'Profile' },
//               ].map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
//                     activeTab === item.id
//                       ? 'bg-blue-100 text-blue-700 font-semibold'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <span className="mr-3">{item.icon}</span>
//                   {item.label}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="flex-1">
//             {renderContent()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

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
  FaFileAlt
} from 'react-icons/fa';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
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
  const [loading, setLoading] = useState(false);


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

  useEffect(() => {
    fetchWalletBalance();
    fetchPaymentHistory();
  }, []);


// Add these state variables
const [isProcessingPayment, setIsProcessingPayment] = useState(false);
const [paymentHistory, setPaymentHistory] = useState([]);

// Add these useEffect hooks to load data
useEffect(() => {
  fetchWalletBalance();
  fetchPaymentHistory();
}, []);

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


  const [userId, setUserId] = useState('user123'); // You can get this from auth context


  // Fetch wallet balance on component mount
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // const fetchWalletBalance = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:8080/api/payments/wallet/${userId}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setWalletBalance(data.balance || 0);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching wallet balance:', error);
  //   }
  // };

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
      setLoading(false);
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
      console.log('📡 Fetching user profile...');
      
      // Try to get user from localStorage first
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          console.log('✅ Using stored user data:', parsedData);
          setUserData(parsedData);
          setUserId(parsedData.id || parsedData.email); // Use ID or email as fallback
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
        setUserId(userData.id || userData.email); // Use ID or email as fallback
        
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



  // const handlePayment = () => {
  //   alert(`Payment processing with ${selectedMethod}`);
  // };

  // Calculate total income from waste sales
  const totalIncome = paymentHistory
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  // Calculate total payments made
  const totalPayments = paymentHistory
    .filter(item => item.type === 'payment')
    .reduce((sum, item) => sum + item.amount, 0);

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
          <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}

              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Wallet Balance */}
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

                {/* Total Income */}
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

                {/* Total Payments */}
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

              {/* Row Layout - All sections in one row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Waste Selling */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FaRecycle className="text-green-600" />
                      Sell Your Waste
                    </h2>
                    
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
                          <option value="plastic">Plastic - LKR 50/kg</option>
                          <option value="paper">Paper - LKR 30/kg</option>
                          <option value="metal">Metal - LKR 80/kg</option>
                          <option value="glass">Glass - LKR 40/kg</option>
                          <option value="organic">Organic - LKR 20/kg</option>
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
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold text-base transition-colors duration-200 mt-6 shadow-sm flex items-center justify-center gap-2"
                      >
                        <FaRecycle className="w-4 h-4" />
                        {loading ? 'Processing...' : `Sell Waste - LKR ${calculateEstimatedValue().toFixed(2)}`}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Payment Processing */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <FaCreditCard className="text-blue-600" />
                      Make Payment
                    </h2>

                    {/* Current Balance Display */}
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
                    
                    {/* Amount Input */}
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

                    {/* Payment Methods */}
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

                    {/* Card Details */}
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

                    {/* Pay Button */}
                    <button
                      onClick={handlePayment}
                      disabled={!totalAmount || parseFloat(totalAmount) <= 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 mt-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <FaCreditCard className="w-5 h-5" />
                      Pay LKR {totalAmount ? parseFloat(totalAmount).toFixed(2) : '0.00'}
                    </button>

                    {/* Security Note */}
                    <div className="text-center mt-4">
                      <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                        <FaShieldAlt className="text-blue-500" />
                        Your payment is secure and encrypted
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Transaction History */}
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