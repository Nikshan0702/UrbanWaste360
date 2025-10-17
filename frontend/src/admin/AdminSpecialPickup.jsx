import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaTrash,
  FaExclamationTriangle,
  FaRecycle,
  FaLaptop,
  FaBatteryFull,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaSearch,
  FaFilter,
  FaUserTie
} from 'react-icons/fa';

const AdminSpecialPickupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allPickups, setAllPickups] = useState([]);
  const [filteredPickups, setFilteredPickups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [collectors, setCollectors] = useState([]);
  const [assigningCollector, setAssigningCollector] = useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState('');

  // Waste types for display
  const wasteTypes = [
    { id: 'bulky', name: 'Bulky Items', icon: FaTrash },
    { id: 'hazardous', name: 'Hazardous Waste', icon: FaExclamationTriangle },
    { id: 'e_waste', name: 'E-Waste', icon: FaLaptop },
    { id: 'recyclable', name: 'Recyclables', icon: FaRecycle },
    { id: 'batteries', name: 'Batteries', icon: FaBatteryFull }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || 'demo-token';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Helper function to handle API errors
  const handleApiError = (error, defaultMessage) => {
    console.error('API Error:', error);
    if (error.message.includes('401')) {
      setError('Authentication failed. Please login again.');
      // Optionally redirect to login
      // window.location.href = '/login';
    } else if (error.message.includes('403')) {
      setError('Access denied. Admin privileges required.');
    } else {
      setError(defaultMessage);
    }
  };

  useEffect(() => {
    fetchAllPickups();
    fetchCollectors();
  }, []);

  useEffect(() => {
    filterPickups();
  }, [allPickups, searchTerm, statusFilter]);

  const fetchAllPickups = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:8080/api/pickups/admin/all', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pickups = await response.json();
      setAllPickups(pickups);
    } catch (error) {
      handleApiError(error, 'Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectors = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const allUsers = await response.json();
        // Filter collectors - check both 'COLLECTOR' and 'collector' case
        const collectors = allUsers.filter(user => 
          user.role === 'COLLECTOR' || user.role === 'collector'
        );
        setCollectors(collectors);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching collectors:', error);
      // Don't show error for collectors as it's not critical
    }
  };

  const filterPickups = () => {
    let filtered = allPickups;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pickup => pickup.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pickup =>
        (pickup.user?.name?.toLowerCase().includes(term)) ||
        (pickup.userId?.name?.toLowerCase().includes(term)) ||
        pickup.wasteType?.toLowerCase().includes(term) ||
        pickup.description?.toLowerCase().includes(term) ||
        pickup.pickupId?.toLowerCase().includes(term)
      );
    }

    setFilteredPickups(filtered);
  };

  const updatePickupStatus = async (pickupId, status, rejectionReason = '') => {
    try {
      setLoading(true);
      setError('');
      
      const updateData = { status };
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const response = await fetch(`http://localhost:8080/api/pickups/admin/${pickupId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess(`Pickup ${status} successfully`);
      await fetchAllPickups();
      setShowDetailsModal(false);
    } catch (error) {
      handleApiError(error, 'Failed to update pickup status');
    } finally {
      setLoading(false);
    }
  };

  const assignToCollector = async (pickupId, collectorId) => {
    try {
      setAssigningCollector(true);
      setError('');
      
      const response = await fetch(`http://localhost:8080/api/pickups/admin/${pickupId}/assign`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ collectorId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess('Pickup assigned to collector successfully');
      await fetchAllPickups();
      setShowDetailsModal(false);
      setSelectedCollectorId('');
    } catch (error) {
      handleApiError(error, 'Failed to assign pickup to collector');
    } finally {
      setAssigningCollector(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const viewPickupDetails = (pickup) => {
    setSelectedPickup(pickup);
    setSelectedCollectorId(pickup.assignedCollectorId || pickup.collectorId || '');
    setShowDetailsModal(true);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Special Pickup Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage all special waste pickup requests
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Pickups
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by user, waste type, description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchAllPickups}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FaFilter className="w-4 h-4" />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Pickups Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waste Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPickups.map((pickup) => {
                    const wasteType = wasteTypes.find(w => w.id === pickup.wasteType);
                    const IconComponent = wasteType?.icon || FaTrash;
                    const userName = pickup.user?.name || pickup.userId?.name || 'N/A';
                    
                    return (
                      <tr key={pickup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pickup.pickupId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-gray-900">{wasteType?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(pickup.pickupDate)} {pickup.pickupTime ? `at ${pickup.pickupTime}` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>
                            {pickup.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pickup.assignedCollectorId || pickup.collectorId ? (
                            <span className="flex items-center gap-1 text-purple-600">
                              <FaUserTie className="w-3 h-3" />
                              Assigned
                            </span>
                          ) : (
                            <span className="text-gray-500">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          LKR {pickup.price || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewPickupDetails(pickup)}
                            className="text-emerald-600 hover:text-emerald-900 mr-3"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          {pickup.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updatePickupStatus(pickup.id, 'approved')}
                                className="text-green-600 hover:text-green-900 mr-2"
                                title="Approve"
                              >
                                <FaCheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) {
                                    updatePickupStatus(pickup.id, 'rejected', reason);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <FaTimesCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredPickups.length === 0 && (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-gray-400 text-3xl mx-auto mb-2" />
                  <p className="text-gray-500">
                    {allPickups.length === 0 ? 'No pickups available' : 'No pickups match your filters'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedPickup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Pickup Details - {selectedPickup.pickupId}
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimesCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedPickup.user?.name || selectedPickup.userId?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Waste Type</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {wasteTypes.find(w => w.id === selectedPickup.wasteType)?.name || selectedPickup.wasteType}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedPickup.pickupDate)} {selectedPickup.pickupTime ? `at ${selectedPickup.pickupTime}` : ''}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPickup.status)}`}>
                          {selectedPickup.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPickup.description || 'No description'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPickup.location || 'N/A'}</p>
                  </div>

                  {selectedPickup.specialInstructions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPickup.specialInstructions}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Urgency</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPickup.urgency || 'normal'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <p className="mt-1 text-sm text-gray-900">LKR {selectedPickup.price || '0.00'}</p>
                    </div>
                  </div>

                  {/* Collector Assignment Section */}
                  {(selectedPickup.status === 'approved' || selectedPickup.status === 'assigned') && (
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to Collector
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedCollectorId}
                          onChange={(e) => setSelectedCollectorId(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select a collector</option>
                          {collectors.map(collector => (
                            <option key={collector.id} value={collector.id}>
                              {collector.name} - {collector.email}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignToCollector(selectedPickup.id, selectedCollectorId)}
                          disabled={!selectedCollectorId || assigningCollector}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <FaUserTie className="w-4 h-4" />
                          {assigningCollector ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                      {(selectedPickup.assignedCollectorId || selectedPickup.collectorId) && (
                        <p className="text-sm text-green-600 mt-2">
                          Currently assigned to: {collectors.find(c => c.id === (selectedPickup.assignedCollectorId || selectedPickup.collectorId))?.name || 'Collector'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    {selectedPickup.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updatePickupStatus(selectedPickup.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              updatePickupStatus(selectedPickup.id, 'rejected', reason);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSpecialPickupComponent;