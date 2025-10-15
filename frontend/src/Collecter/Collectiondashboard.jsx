import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ZoneSelection from './ZoneSelectionPage';
import NearbyBinsComponent from './NearbyBinsComponent';
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [binsData, setBinsData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [routesData, setRoutesData] = useState([]);

  const [userId, setUserId] = useState('user123'); // You can get this from auth context

  useEffect(() => {
    fetchUserData();
    fetchBinsData();
    fetchCollectionData();
    fetchRoutesData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          if (!parsedData.id) throw new Error('Invalid user data');
          setUserData(parsedData);
          setUserId(parsedData.id);
        } catch (error) {
          setError('Failed to load user data from localStorage');
        }
      } else {
        const response = await fetch('http://localhost:8080/api/users/profile');
        if (response.ok) {
          const user = await response.json();
          setUserData(user);
          setUserId(user.id);
          localStorage.setItem('userData', JSON.stringify(user));
        }
      }
    } catch (error) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBinsData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/bins');
      if (response.ok) {
        const bins = await response.json();
        setBinsData(bins);
      }
    } catch (error) {
      setError('Error fetching bins data');
    }
  };

  const fetchCollectionData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/collections');
      if (response.ok) {
        const collections = await response.json();
        setCollectionData(collections);
      }
    } catch (error) {
      setError('Error fetching collection data');
    }
  };

  const fetchRoutesData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/routes');
      if (response.ok) {
        const routes = await response.json();
        setRoutesData(routes);
      }
    } catch (error) {
      setError('Error fetching routes data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/'); // Use React Router's navigate to avoid full page reload
  };

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

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {displayData.name || 'User'}!</h1>
              <p className="text-gray-600">Smart Waste Management Dashboard</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Full Name</label><p className="mt-1 text-lg font-semibold">{displayData.name}</p></div>
                <div><label className="block text-sm font-medium text-gray-700">Email</label><p className="mt-1 text-lg font-semibold">{displayData.email}</p></div>
                <div><label className="block text-sm font-medium text-gray-700">Phone</label><p className="mt-1 text-lg font-semibold">{displayData.phone || 'Not provided'}</p></div>
                <div><label className="block text-sm font-medium text-gray-700">Address</label><p className="mt-1 text-lg font-semibold">{displayData.address || 'Not provided'}</p></div>
              </div>
            </div>
          </div>
        );
        
      case 'bins':
        return (
          <NearbyBinsComponent binsData={binsData} />
        );

      case 'collection':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Record Collection</h2>
              <div className="space-y-4">
                {collectionData.length === 0 ? (
                  <div className="text-center py-8"><p className="text-gray-500">No collection records available.</p></div>
                ) : (
                  collectionData.map((record) => (
                    <div key={record.id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{record.date}</h3>
                      <p className="text-gray-600">Collected by: {record.collector}</p>
                      <p className="text-sm text-gray-500">Waste Type: {record.wasteType}</p>
                      <p className="text-sm text-gray-500">Amount: {record.amount}kg</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div> 
        );
        
      case 'routes':
        return (
          <ZoneSelection userId={userId} />
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
        

      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <div className="text-center py-8">
              <p className="text-gray-500">This section is coming soon.</p>
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FaRecycle className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">UrbanWaste360</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">
              {userData ? `Welcome, ${userData.name}` : 'Using stored data'}
            </span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
              <FaSignOutAlt className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
                { id: 'bins', label: 'Waste Bins', icon: FaRecycle },
                { id: 'collection', label: 'Record Collection', icon: FaHistory },
                { id: 'routes', label: 'Routes', icon: FaCalendarAlt },
                { id: 'profile', label: 'Profile', icon: FaUser } // Added Profile tab
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-label={`Go to ${item.label}`}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
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

          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
