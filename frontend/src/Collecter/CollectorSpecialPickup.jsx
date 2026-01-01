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
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const CollectorSpecialPickupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignedPickups, setAssignedPickups] = useState([]);
  const [filteredPickups, setFilteredPickups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  // Status mapping from backend to frontend display
  const statusDisplayMap = {
    'SCHEDULED': 'Scheduled',
    'ASSIGNED': 'Assigned',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled'
  };

  useEffect(() => {
    fetchAssignedPickups();
  }, []);

  useEffect(() => {
    filterPickups();
  }, [assignedPickups, searchTerm, statusFilter]);

  const fetchAssignedPickups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      console.log('Collector ID:', userData?.id);
      console.log('Token:', token);
      
      const response = await fetch(`http://localhost:8080/api/pickups/collector/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const pickups = await response.json();
        console.log('Fetched pickups:', pickups);
        setAssignedPickups(pickups);
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to fetch assigned pickups');
      }
    } catch (error) {
      console.error('Error fetching pickups:', error);
      setError('Failed to load assigned pickups: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterPickups = () => {
    let filtered = assignedPickups;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pickup => pickup.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pickup =>
        pickup.userId?.name?.toLowerCase().includes(term) ||
        pickup.wasteType?.toLowerCase().includes(term) ||
        pickup.pickupId?.toLowerCase().includes(term)
      );
    }

    setFilteredPickups(filtered);
  };

  const updatePickupStatus = async (pickupId, status) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      console.log('Updating pickup:', pickupId, 'to status:', status);
      
      const response = await fetch(`http://localhost:8080/api/pickups/${pickupId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: status,
          // Include other required fields if needed by your backend
          notes: `Status changed to ${status} by collector`
        })
      });

      if (response.ok) {
        const updatedPickup = await response.json();
        console.log('Update successful:', updatedPickup);
        setSuccess(`Pickup status updated to ${statusDisplayMap[status] || status}`);
        await fetchAssignedPickups(); // Refresh the list
        setShowDetailsModal(false);
      } else {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        throw new Error(`Failed to update status: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update pickup status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const viewPickupDetails = (pickup) => {
    setSelectedPickup(pickup);
    setShowDetailsModal(true);
  };

  const canUpdateStatus = (currentStatus, newStatus) => {
    const allowedTransitions = {
      'SCHEDULED': ['IN_PROGRESS', 'CANCELLED'],
      'ASSIGNED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };
    return allowedTransitions[currentStatus]?.includes(newStatus);
  };

  const getAvailableStatusActions = (currentStatus) => {
    const actions = [];
    
    if (canUpdateStatus(currentStatus, 'IN_PROGRESS')) {
      actions.push({
        status: 'IN_PROGRESS',
        label: 'Start Collection',
        color: 'bg-orange-600 hover:bg-orange-700'
      });
    }
    
    if (canUpdateStatus(currentStatus, 'COMPLETED')) {
      actions.push({
        status: 'COMPLETED',
        label: 'Mark as Completed',
        color: 'bg-green-600 hover:bg-green-700'
      });
    }
    
    if (canUpdateStatus(currentStatus, 'CANCELLED')) {
      actions.push({
        status: 'CANCELLED',
        label: 'Cancel Pickup',
        color: 'bg-red-600 hover:bg-red-700'
      });
    }
    
    return actions;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Assigned Pickups
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your assigned special waste pickups
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
                  placeholder="Search by user, waste type..."
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
                onClick={fetchAssignedPickups}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FaFilter className="w-4 h-4" />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Pickups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredPickups.length > 0 ? (
            filteredPickups.map((pickup) => {
              const wasteType = wasteTypes.find(w => w.id === pickup.wasteType);
              const IconComponent = wasteType?.icon || FaTrash;
              const statusActions = getAvailableStatusActions(pickup.status);
              
              return (
                <div key={pickup.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{wasteType?.name}</h3>
                        <p className="text-sm text-gray-500">{pickup.pickupId}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>
                      {statusDisplayMap[pickup.status] || pickup.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>{formatDate(pickup.pickupDate)} at {pickup.pickupTime}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span className="truncate">{pickup.location}</span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>User:</strong> {pickup.userId?.name || 'N/A'}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Price:</strong> LKR {pickup.price || '0'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => viewPickupDetails(pickup)}
                      className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
                    >
                      <FaEye className="w-3 h-3" />
                      View Details
                    </button>
                    
                    <div className="flex gap-2">
                      {statusActions.map(action => (
                        <button
                          key={action.status}
                          onClick={() => updatePickupStatus(pickup.id, action.status)}
                          disabled={loading}
                          className={`${action.color} text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <FaCalendarAlt className="text-gray-400 text-3xl mx-auto mb-2" />
              <p className="text-gray-500">No assigned pickups found</p>
              <button
                onClick={fetchAssignedPickups}
                className="mt-2 text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Try refreshing
              </button>
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
                      <p className="mt-1 text-sm text-gray-900">{selectedPickup.userId?.name || 'N/A'}</p>
                      {selectedPickup.userId?.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <FaPhone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedPickup.userId.phone}</span>
                        </div>
                      )}
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
                      <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedPickup.pickupDate)} at {selectedPickup.pickupTime}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPickup.status)}`}>
                          {statusDisplayMap[selectedPickup.status] || selectedPickup.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPickup.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPickup.location}</p>
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
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPickup.urgency || 'standard'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <p className="mt-1 text-sm text-gray-900">LKR {selectedPickup.price || '0'}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    {getAvailableStatusActions(selectedPickup.status).map(action => (
                      <button
                        key={action.status}
                        onClick={() => updatePickupStatus(selectedPickup.id, action.status)}
                        disabled={loading}
                        className={`${action.color} text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50`}
                      >
                        {action.label}
                      </button>
                    ))}
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
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 z-50 max-w-md">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError('')}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                <FaTimesCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 z-50 max-w-md">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-2" />
              <p className="text-green-700">{success}</p>
              <button
                onClick={() => setSuccess('')}
                className="ml-2 text-green-400 hover:text-green-600"
              >
                <FaTimesCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorSpecialPickupComponent;