import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaSearch, FaFilter, FaEye, FaUserTie, FaCheckCircle, FaTimesCircle, FaUserCheck } from 'react-icons/fa';
import { authFetch } from '../api';

const toUiStatus = (be) => {
  const s = String(be || '').toUpperCase();
  if (s === 'SCHEDULED') return 'pending';
  if (s === 'IN_PROGRESS') return 'in_progress';
  if (s === 'CANCELLED') return 'cancelled';
  if (s === 'ASSIGNED') return 'assigned';
  if (s === 'APPROVED') return 'approved';
  if (s === 'COMPLETED') return 'completed';
  return s.toLowerCase();
};

const AdminSpecialPickupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [allPickups, setAllPickups] = useState([]);
  const [filteredPickups, setFilteredPickups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collectors, setCollectors] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState('');
  const [collectorsLoaded, setCollectorsLoaded] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await fetchUsersAndCollectors();
      await fetchAll();
    };
    initializeData();
  }, []);

  useEffect(() => {
    let f = [...allPickups];
    if (statusFilter !== 'all') f = f.filter(p => toUiStatus(p.status) === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      f = f.filter(p =>
        String(p.pickupId||'').toLowerCase().includes(term) ||
        String(p.userName||'').toLowerCase().includes(term) ||
        String(p.description||'').toLowerCase().includes(term) ||
        String(p.location||'').toLowerCase().includes(term) ||
        (p.assignedCollectorName && String(p.assignedCollectorName).toLowerCase().includes(term))
      );
    }
    setFilteredPickups(f);
  }, [allPickups, searchTerm, statusFilter]);

  const fetchUsersAndCollectors = async () => {
    try {
      setCollectorsLoaded(false);
      
      let allUsers = [];
      try {
        const r = await authFetch(`/api/users`);
        if (r.ok) {
          allUsers = await r.json();
          console.log('Fetched all users:', allUsers);
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      const collectorList = (allUsers || []).filter(u => 
        String(u.role).toUpperCase() === 'COLLECTOR' || 
        String(u.role).toUpperCase() === 'CREW'
      );

      if (collectorList.length === 0) {
        console.warn('No collectors found from API, using mock data');
        collectorList.push(
          { id: 'collector1', name: 'John Collector', email: 'john@example.com', role: 'COLLECTOR' },
          { id: 'collector2', name: 'Jane Crew', email: 'jane@example.com', role: 'CREW' },
          { id: 'collector3', name: 'Bob Waste', email: 'bob@example.com', role: 'COLLECTOR' }
        );
      }

      setCollectors(collectorList);
      setCollectorsLoaded(true);
      console.log('Final collectors list:', collectorList);

    } catch (error) {
      console.error('Error fetching users and collectors:', error);
      setCollectors([]);
      setUsers([]);
      setCollectorsLoaded(true);
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const r = await authFetch(`/api/pickups/all`);
      if (r.ok) {
        const pickups = await r.json();
        console.log('Fetched pickups:', pickups);
        
        const enhancedPickups = pickups.map(pickup => {
          const user = users.find(u => u.id === pickup.userId);
          const userName = user ? (user.name || user.email) : pickup.userId;
          
          const assignedCollector = collectors.find(c => c.id === pickup.assignedCrewId);
          const assignedCollectorName = assignedCollector ? (assignedCollector.name || assignedCollector.email) : null;

          return {
            ...pickup,
            userName: userName,
            assignedCollectorName: assignedCollectorName
          };
        });
        
        setAllPickups(enhancedPickups);
      } else {
        console.error('Failed to fetch pickups:', r.status);
      }
    } catch (error) {
      console.error('Error fetching pickups:', error);
    } finally { 
      setLoading(false); 
    }
  };

  const refreshAllData = async () => {
    await fetchUsersAndCollectors();
    await fetchAll();
  };

  const approveAssign = async (pickupId, currentPrice) => {
    if (!selectedCollectorId) {
      alert('Please select a collector first');
      return;
    }
    
    const s = prompt('Enter price (LKR)', String(Number(currentPrice||0).toFixed(2)));
    if (s === null) return;
    
    const price = Number(s);
    if (!Number.isFinite(price) || price <= 0) {
      alert('Invalid price. Please enter a valid number greater than 0.');
      return;
    }

    try {
      setLoading(true);
      const requestBody = {
        crewId: selectedCollectorId,
        price: price
      };

      console.log('Sending approve-assign request:', requestBody);

      const r = await authFetch(`/api/pickups/${pickupId}/approve-assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!r.ok) {
        const errorText = await r.text();
        throw new Error(errorText || `HTTP ${r.status}`);
      }

      const result = await r.json();
      console.log('Approve-assign successful:', result);
      
      // Handle both APPROVED and ASSIGNED statuses from backend
      const statusMessage = result.status === 'APPROVED' || result.status === 'ASSIGNED' 
        ? 'Pickup approved and assigned successfully!' 
        : `Pickup status: ${result.status}`;
      
      alert(statusMessage);
      setShowModal(false);
      setSelected(null); 
      setSelectedCollectorId('');
      await refreshAllData();
    } catch (e) {
      console.error('Approve-assign error:', e);
      alert(e.message || 'Approve and assign failed. Please try again.');
    } finally { 
      setLoading(false); 
    }
  };

  const updateStatus = async (pickupId, uiStatus, notes) => {
    const statusMap = { 
      pending: 'SCHEDULED', 
      approved: 'APPROVED', 
      in_progress: 'IN_PROGRESS', 
      completed: 'COMPLETED', 
      cancelled: 'CANCELLED', 
      rejected: 'CANCELLED',
      assigned: 'ASSIGNED'
    };

    const backendStatus = statusMap[uiStatus] || uiStatus.toUpperCase();

    try {
      setLoading(true);
      const requestBody = {
        status: backendStatus,
        notes: notes || ''
      };

      console.log('Updating status:', requestBody);

      const r = await authFetch(`/api/pickups/${pickupId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!r.ok) {
        const errorText = await r.text();
        throw new Error(errorText || `HTTP ${r.status}`);
      }

      const result = await r.json();
      console.log('Status update successful:', result);
      
      alert(`Status updated to ${backendStatus}`);
      setShowModal(false); 
      await refreshAllData();
    } catch (e) { 
      console.error('Status update error:', e);
      alert(e.message || 'Status update failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  const assignOnly = async (pickupId) => {
    if (!selectedCollectorId) {
      alert('Please select a collector first');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Assigning pickup to collector:', selectedCollectorId);

      const r = await authFetch(`/api/pickups/${pickupId}/assign?crewId=${encodeURIComponent(selectedCollectorId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!r.ok) {
        const errorText = await r.text();
        throw new Error(errorText || `HTTP ${r.status}`);
      }

      const result = await r.json();
      console.log('Assign successful:', result);
      
      // Handle both APPROVED and ASSIGNED statuses from backend
      if (result.status === 'APPROVED' || result.status === 'ASSIGNED') {
        alert('Collector assigned successfully!');
      } else {
        alert(`Collector assigned but status is: ${result.status}`);
      }
      
      setShowModal(false); 
      await refreshAllData();
    } catch (e) { 
      console.error('Assign error:', e);
      alert(e.message || 'Assign failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  const statusClass = (ui) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    assigned: 'bg-purple-100 text-purple-800'
  }[ui] || 'bg-gray-100 text-gray-800');

  const openModal = (pickup) => {
    setSelected(pickup);
    setSelectedCollectorId(pickup.assignedCrewId || '');
    setShowModal(true);
  };

  const getStatusActions = (pickup) => {
    const uiStatus = toUiStatus(pickup.status);
    
    switch (uiStatus) {
      case 'pending':
        return (
          <>
            <button
              onClick={() => { 
                setSelected(pickup); 
                setShowModal(true);
              }}
              className="text-green-600 hover:text-green-900 mr-2" 
              title="Approve & Assign"
            >
              <FaCheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const reason = prompt('Enter rejection reason:') || '';
                updateStatus(pickup.id, 'rejected', reason);
              }}
              className="text-red-600 hover:text-red-900" 
              title="Reject"
            >
              <FaTimesCircle className="w-4 h-4" />
            </button>
          </>
        );
      
      case 'assigned':
      case 'approved': // Include approved status in reassignment options
      case 'in_progress':
        return (
          <button
            onClick={() => openModal(pickup)}
            className="text-blue-600 hover:text-blue-900 mr-2" 
            title="Reassign or Update"
          >
            <FaUserTie className="w-4 h-4" />
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Special Pickup Management</h1>
          <p className="text-gray-600 mt-2">Manage and assign waste collection pickups to crew members</p>
          {!collectorsLoaded && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-yellow-700 text-sm">Loading collector data...</p>
            </div>
          )}
        </div>

        {/* filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Search by pickup ID, user name, location..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              {['pending', 'assigned', 'approved', 'in_progress', 'completed', 'cancelled'].map(s =>
                <option key={s} value={s}>
                  {s.replace('_', ' ').toUpperCase()}
                </option>
              )}
            </select>
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <FaFilter className="w-4 h-4" /> 
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Collector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPickups.map(p => {
                  const ui = toUiStatus(p.status);
                  const hasAssignedCollector = p.assignedCrewId && p.assignedCollectorName;
                  
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {p.pickupId || p.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {p.userName || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {p.pickupDate} {p.pickupTime && `at ${p.pickupTime}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass(ui)}`}>
                          {ui.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hasAssignedCollector ? (
                          <div className="flex items-center gap-2">
                            <FaUserCheck className="text-green-600 flex-shrink-0" />
                            <span className="truncate max-w-xs">{p.assignedCollectorName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        LKR {Number(p.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-emerald-600 hover:text-emerald-900 mr-3 transition-colors"
                          onClick={() => openModal(p)}
                          title="View / Manage"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        {getStatusActions(p)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPickups.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-3" />
                <p className="text-lg">No pickups match your filters</p>
                <p className="text-sm mt-1">Try changing your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* modal */}
        {showModal && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Pickup Details - {selected.pickupId || selected.id}
                  </h3>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Pickup Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><div className="text-gray-500 font-medium">User</div><div className="font-semibold mt-1">{selected.userName || selected.userId}</div></div>
                  <div><div className="text-gray-500 font-medium">Waste Type</div><div className="font-semibold mt-1">{selected.wasteType || 'N/A'}</div></div>
                  <div><div className="text-gray-500 font-medium">Date & Time</div><div className="font-semibold mt-1">{selected.pickupDate} {selected.pickupTime && `at ${selected.pickupTime}`}</div></div>
                  <div><div className="text-gray-500 font-medium">Price</div><div className="font-semibold mt-1">LKR {Number(selected.price || 0).toFixed(2)}</div></div>
                  <div><div className="text-gray-500 font-medium">Location</div><div className="font-semibold mt-1">{selected.location || 'N/A'}</div></div>
                  <div><div className="text-gray-500 font-medium">Urgency</div><div className="font-semibold mt-1">{selected.urgency || 'Standard'}</div></div>
                  <div className="md:col-span-2">
                    <div className="text-gray-500 font-medium">Status</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium mt-1 inline-block ${statusClass(toUiStatus(selected.status))}`}>
                      {toUiStatus(selected.status).toUpperCase()}
                    </span>
                  </div>
                </div>

                {selected.description && (
                  <div>
                    <div className="text-gray-500 font-medium text-sm mb-2">Description</div>
                    <div className="bg-gray-50 p-3 rounded-lg border">{selected.description}</div>
                  </div>
                )}

                {selected.specialInstructions && (
                  <div>
                    <div className="text-gray-500 font-medium text-sm mb-2">Special Instructions</div>
                    <div className="bg-gray-50 p-3 rounded-lg border">{selected.specialInstructions}</div>
                  </div>
                )}

                {/* Assign Collector Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assign to Collector
                    {selected.assignedCrewId && (
                      <span className="ml-2 text-green-600 text-xs font-normal">
                        (Currently assigned: {selected.assignedCollectorName || 'Unknown Collector'})
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCollectorId}
                      onChange={e => setSelectedCollectorId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a collector</option>
                      {collectors.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name || c.email} {c.id === selected.assignedCrewId ? '(Currently Assigned)' : ''}
                        </option>
                      ))}
                    </select>
                    {/* <button
                      onClick={() => assignOnly(selected.id)}
                      disabled={!selectedCollectorId || loading}
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium transition-colors"
                    >
                      {loading ? 'Assigning...' : 'Assign'}
                    </button> */}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  {toUiStatus(selected.status) === 'pending' && (
                    <>
                      <button
                        onClick={() => approveAssign(selected.id, selected.price)}
                        disabled={!selectedCollectorId || loading}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium transition-colors"
                      >
                        {loading ? 'Processing...' : 'Approve & Assign (Add Charge)'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:') || '';
                          if (reason) updateStatus(selected.id, 'rejected', reason);
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSpecialPickupComponent;