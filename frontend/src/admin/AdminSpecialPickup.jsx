// import React, { useState, useEffect } from 'react';
// import {
//   FaCalendarAlt,
//   FaTrash,
//   FaExclamationTriangle,
//   FaRecycle,
//   FaLaptop,
//   FaBatteryFull,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaEye,
//   FaSearch,
//   FaFilter,
//   FaUserTie
// } from 'react-icons/fa';
// import SpecialPickups from './SpecialPickups';

// const API = 'http://localhost:8080';

// const AdminSpecialPickupComponent = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [allPickups, setAllPickups] = useState([]);
//   const [filteredPickups, setFilteredPickups] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [selectedPickup, setSelectedPickup] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [collectors, setCollectors] = useState([]);
//   const [assigningCollector, setAssigningCollector] = useState(false);
//   const [selectedCollectorId, setSelectedCollectorId] = useState('');

//   // UI <-> Backend status mapping
//   const toBackendStatus = (ui) => {
//     const s = String(ui || '').toLowerCase();
//     switch (s) {
//       case 'pending': return 'SCHEDULED';
//       case 'approved': return 'APPROVED';
//       case 'rejected': return 'CANCELLED';
//       case 'assigned': // UI only – we’ll treat as IN_PROGRESS in old flow
//       case 'in_progress': return 'IN_PROGRESS';
//       case 'completed': return 'COMPLETED';
//       case 'cancelled': return 'CANCELLED';
//       default: return s.toUpperCase();
//     }
//   };
//   const toUiStatus = (be) => {
//     const s = String(be || '').toUpperCase();
//     switch (s) {
//       case 'SCHEDULED': return 'pending';
//       case 'APPROVED': return 'approved';
//       case 'IN_PROGRESS': return 'in_progress';
//       case 'COMPLETED': return 'completed';
//       case 'CANCELLED': return 'cancelled';
//       default: return s.toLowerCase();
//     }
//   };

//   // Waste types for display
//   const wasteTypes = [
//     { id: 'bulky', name: 'Bulky Items', icon: FaTrash },
//     { id: 'hazardous', name: 'Hazardous Waste', icon: FaExclamationTriangle },
//     { id: 'e_waste', name: 'E-Waste', icon: FaLaptop },
//     { id: 'recyclable', name: 'Recyclables', icon: FaRecycle },
//     { id: 'batteries', name: 'Batteries', icon: FaBatteryFull }
//   ];

//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'approved', label: 'Approved' },
//     { value: 'in_progress', label: 'In Progress' },
//     { value: 'completed', label: 'Completed' },
//     { value: 'cancelled', label: 'Cancelled' }
//   ];

//   const getAuthHeaders = () => {
//     const token = localStorage.getItem('authToken') || 'demo-token';
//     return {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     };
//   };

//   const handleApiError = (error, defaultMessage) => {
//     console.error('API Error:', error);
//     if (String(error?.message || '').includes('401')) {
//       setError('Authentication failed. Please login again.');
//     } else if (String(error?.message || '').includes('403')) {
//       setError('Access denied. Admin privileges required.');
//     } else {
//       setError(defaultMessage);
//     }
//   };

//   useEffect(() => {
//     fetchAllPickups();
//     fetchCollectors();
//   }, []);

//   useEffect(() => {
//     filterPickups();
//   }, [allPickups, searchTerm, statusFilter]);

//   const fetchAllPickups = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const res = await fetch(`${API}/api/pickups/all`, { headers: getAuthHeaders() });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//       const pickups = await res.json();
//       setAllPickups(pickups);
//     } catch (e) {
//       handleApiError(e, 'Failed to load pickups');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCollectors = async () => {
//     try {
//       const res = await fetch(`${API}/api/users`, { headers: getAuthHeaders() });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//       const allUsers = await res.json();
//       const collectorsOnly = (allUsers || []).filter(u => (u.role || '').toUpperCase() === 'COLLECTOR');
//       setCollectors(collectorsOnly);
//     } catch (e) {
//       console.warn('Collectors fetch failed (non-blocking):', e);
//     }
//   };

//   const filterPickups = () => {
//     let filtered = [...allPickups];

//     // By status
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(p => toUiStatus(p.status) === statusFilter);
//     }

//     // By search text
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(p =>
//         String(p.user?.name || '').toLowerCase().includes(term) ||
//         String(p.wasteType || '').toLowerCase().includes(term) ||
//         String(p.description || '').toLowerCase().includes(term) ||
//         String(p.pickupId || '').toLowerCase().includes(term) ||
//         String(p.location || '').toLowerCase().includes(term)
//       );
//     }

//     setFilteredPickups(filtered);
//   };

//   /** NEW: Approve + Assign + Add charge to Outstanding */
//   const approveAssignWithCharge = async (pickupId) => {
//     try {
//       if (!selectedCollectorId) {
//         alert('Select a collector first.');
//         return;
//       }
//       // Ask/confirm price (use selectedPickup.price as default if present)
//       const defaultPrice = Number(selectedPickup?.price || 0).toFixed(2);
//       const s = prompt('Enter price (LKR) for this pickup:', defaultPrice);
//       if (s === null) return; // cancelled
//       const price = Number(s);
//       if (!Number.isFinite(price) || price <= 0) {
//         alert('Price must be a positive number.');
//         return;
//       }

//       setLoading(true);
//       setError('');

//       const res = await fetch(`${API}/api/pickups/${pickupId}/approve-assign`, {
//         method: 'PUT',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           crewId: selectedCollectorId,
//           price
//         })
//       });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//       setSuccess('Approved & assigned. Charge added to Outstanding.');
//       await fetchAllPickups();
//       setShowDetailsModal(false);
//       setSelectedCollectorId('');
//     } catch (e) {
//       handleApiError(e, 'Failed to approve & assign');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** Old update flow (still used for reject/cancel/in_progress/completed) */
//   const updatePickupStatus = async (pickupId, uiStatus, notes = '') => {
//     try {
//       setLoading(true);
//       setError('');

//       const status = toBackendStatus(uiStatus);
//       const payload = { status };
//       if (notes) payload.notes = notes;

//       const res = await fetch(`${API}/api/pickups/${pickupId}/status`, {
//         method: 'PUT',
//         headers: getAuthHeaders(),
//         body: JSON.stringify(payload)
//       });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//       setSuccess(`Pickup ${uiStatus} successfully`);
//       await fetchAllPickups();
//       setShowDetailsModal(false);
//     } catch (e) {
//       handleApiError(e, 'Failed to update pickup status');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** Manual assign (does NOT add charge) */
//   const assignToCollector = async (pickupId, collectorId) => {
//     try {
//       if (!collectorId) {
//         alert('Select a collector');
//         return;
//       }
//       setAssigningCollector(true);
//       setError('');

//       const res = await fetch(`${API}/api/pickups/${pickupId}/assign?crewId=${encodeURIComponent(collectorId)}`, {
//         method: 'PUT',
//         headers: getAuthHeaders()
//       });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//       setSuccess('Pickup assigned to collector successfully');
//       await fetchAllPickups();
//       setShowDetailsModal(false);
//       setSelectedCollectorId('');
//     } catch (e) {
//       handleApiError(e, 'Failed to assign pickup to collector');
//     } finally {
//       setAssigningCollector(false);
//     }
//   };

//   const getStatusColor = (uiStatus) => {
//     switch (uiStatus) {
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'approved': return 'bg-blue-100 text-blue-800';
//       case 'in_progress': return 'bg-orange-100 text-orange-800';
//       case 'completed': return 'bg-green-100 text-green-800';
//       case 'cancelled': return 'bg-gray-100 text-gray-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const d = new Date(dateString);
//     if (isNaN(d.getTime())) return dateString; // already yyyy-MM-dd?
//     return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
//   };

//   const viewPickupDetails = (pickup) => {
//     setSelectedPickup(pickup);
//     setSelectedCollectorId(pickup.assignedCollectorId || pickup.collectorId || '');
//     setShowDetailsModal(true);
//   };

//   // Clear flash messages
//   useEffect(() => {
//     if (error || success) {
//       const t = setTimeout(() => { setError(''); setSuccess(''); }, 5000);
//       return () => clearTimeout(t);
//     }
//   }, [error, success]);

//   return (
//     <div className="min-h-screen bg-gray-50 py-6">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Pickup Management</h1>
//           <p className="text-gray-600 text-lg">Manage all special waste pickup requests</p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Search Pickups</label>
//               <div className="relative">
//                 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by user, waste type, description..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//               >
//                 {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//               </select>
//             </div>
//             <div className="flex items-end">
//               <button
//                 onClick={fetchAllPickups}
//                 disabled={loading}
//                 className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
//               >
//                 <FaFilter className="w-4 h-4" />
//                 {loading ? 'Refreshing...' : 'Refresh'}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//           {loading ? (
//             <div className="flex justify-center items-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waste Type</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collector</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredPickups.map((pickup) => {
//                     const wasteType = wasteTypes.find(w => w.id === pickup.wasteType);
//                     const Icon = wasteType?.icon || FaTrash;
//                     const userName = pickup.user?.name || pickup.userName || pickup.userId || 'N/A';
//                     const uiStatus = toUiStatus(pickup.status);

//                     return (
//                       <tr key={pickup.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pickup.pickupId || 'N/A'}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userName}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <Icon className="w-4 h-4 text-emerald-600" />
//                             <span className="text-sm text-gray-900">{wasteType?.name || pickup.wasteType}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {formatDate(pickup.pickupDate)} {pickup.pickupTime ? `at ${pickup.pickupTime}` : ''}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(uiStatus)}`}>
//                             {uiStatus}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {pickup.assignedCrewId || pickup.collectorId ? (
//                             <span className="flex items-center gap-1 text-purple-600">
//                               <FaUserTie className="w-3 h-3" />
//                               Assigned
//                             </span>
//                           ) : (
//                             <span className="text-gray-500">Not assigned</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           LKR {Number(pickup.price || 0).toFixed(2)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <button
//                             onClick={() => viewPickupDetails(pickup)}
//                             className="text-emerald-600 hover:text-emerald-900 mr-3"
//                             title="View Details"
//                           >
//                             <FaEye className="w-4 h-4" />
//                           </button>

//                           {/* Quick Approve & Assign from table when pending */}
//                           {uiStatus === 'pending' && (
//                             <>
//                               <button
//                                 onClick={() => {
//                                   setSelectedPickup(pickup);
//                                   if (!selectedCollectorId) {
//                                     alert('Select a collector inside the details to proceed with Approve & Assign.');
//                                     viewPickupDetails(pickup);
//                                   } else {
//                                     approveAssignWithCharge(pickup.id);
//                                   }
//                                 }}
//                                 className="text-green-600 hover:text-green-900 mr-2"
//                                 title="Approve & Assign"
//                               >
//                                 <FaCheckCircle className="w-4 h-4" />
//                               </button>
//                               <button
//                                 onClick={() => {
//                                   const reason = prompt('Enter rejection reason:');
//                                   if (reason) updatePickupStatus(pickup.id, 'rejected', reason);
//                                 }}
//                                 className="text-red-600 hover:text-red-900"
//                                 title="Reject"
//                               >
//                                 <FaTimesCircle className="w-4 h-4" />
//                               </button>
//                             </>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {filteredPickups.length === 0 && (
//                 <div className="text-center py-8">
//                   <FaCalendarAlt className="text-gray-400 text-3xl mx-auto mb-2" />
//                   <p className="text-gray-500">
//                     {allPickups.length === 0 ? 'No pickups available' : 'No pickups match your filters'}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Details Modal */}
//         {showDetailsModal && selectedPickup && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-xl font-semibold text-gray-900">
//                     Pickup Details - {selectedPickup.pickupId || selectedPickup.id}
//                   </h3>
//                   <button
//                     onClick={() => setShowDetailsModal(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <FaTimesCircle className="w-6 h-6" />
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">User</label>
//                       <p className="mt-1 text-sm text-gray-900">
//                         {selectedPickup.user?.name || selectedPickup.userName || selectedPickup.userId || 'N/A'}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Waste Type</label>
//                       <p className="mt-1 text-sm text-gray-900">
//                         {wasteTypes.find(w => w.id === selectedPickup.wasteType)?.name || selectedPickup.wasteType}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Date</label>
//                       <p className="mt-1 text-sm text-gray-900">
//                         {formatDate(selectedPickup.pickupDate)} {selectedPickup.pickupTime ? `at ${selectedPickup.pickupTime}` : ''}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Status</label>
//                       <p className="mt-1">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(toUiStatus(selectedPickup.status))}`}>
//                           {toUiStatus(selectedPickup.status)}
//                         </span>
//                       </p>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Description</label>
//                     <p className="mt-1 text-sm text-gray-900">{selectedPickup.description || 'No description'}</p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Location</label>
//                     <p className="mt-1 text-sm text-gray-900">{selectedPickup.location || 'N/A'}</p>
//                   </div>

//                   {selectedPickup.specialInstructions && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
//                       <p className="mt-1 text-sm text-gray-900">{selectedPickup.specialInstructions}</p>
//                     </div>
//                   )}

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Urgency</label>
//                       <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPickup.urgency || 'normal'}</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Price</label>
//                       <p className="mt-1 text-sm text-gray-900">LKR {Number(selectedPickup.price || 0).toFixed(2)}</p>
//                     </div>
//                   </div>

//                   {/* Collector Assignment */}
//                   {(toUiStatus(selectedPickup.status) === 'pending' || toUiStatus(selectedPickup.status) === 'approved' || toUiStatus(selectedPickup.status) === 'in_progress') && (
//                     <div className="border-t pt-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Collector</label>
//                       <div className="flex gap-2">
//                         <select
//                           value={selectedCollectorId}
//                           onChange={(e) => setSelectedCollectorId(e.target.value)}
//                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                         >
//                           <option value="">Select a collector</option>
//                           {collectors.map(collector => (
//                             <option key={collector.id} value={collector.id}>
//                               {collector.name} - {collector.email}
//                             </option>
//                           ))}
//                         </select>
//                         <button
//                           onClick={() => assignToCollector(selectedPickup.id, selectedCollectorId)}
//                           disabled={!selectedCollectorId || assigningCollector}
//                           className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
//                         >
//                           <FaUserTie className="w-4 h-4" />
//                           {assigningCollector ? 'Assigning...' : 'Assign'}
//                         </button>
//                       </div>
//                       {(selectedPickup.assignedCrewId || selectedPickup.collectorId) && (
//                         <p className="text-sm text-green-600 mt-2">
//                           Currently assigned to: {collectors.find(c => c.id === (selectedPickup.assignedCrewId || selectedPickup.collectorId))?.name || 'Collector'}
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {/* Actions */}
//                   <div className="flex justify-end space-x-3 pt-4 border-t">
//                     {toUiStatus(selectedPickup.status) === 'pending' && (
//                       <>
//                         <button
//                           onClick={() => approveAssignWithCharge(selectedPickup.id)}
//                           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
//                         >
//                           Approve & Assign (add charge)
//                         </button>
//                         <button
//                           onClick={() => {
//                             const reason = prompt('Enter rejection reason:');
//                             if (reason) updatePickupStatus(selectedPickup.id, 'rejected', reason);
//                           }}
//                           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
//                         >
//                           Reject
//                         </button>
//                       </>
//                     )}
//                     <button
//                       onClick={() => setShowDetailsModal(false)}
//                       className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Flash Messages */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
//             <div className="flex items-center">
//               <FaExclamationTriangle className="text-red-400 mr-2" />
//               <p className="text-red-700">{error}</p>
//             </div>
//           </div>
//         )}
//         {success && (
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
//             <div className="flex items-center">
//               <FaCheckCircle className="text-green-400 mr-2" />
//               <p className="text-green-700">{success}</p>
//             </div>
//           </div>
//         )}
//       </div>


   
//     </div>
//   );
// };

// export default AdminSpecialPickupComponent;


import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaSearch, FaFilter, FaEye, FaUserTie, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { authFetch } from '../api';

const toUiStatus = (be) => {
  const s = String(be || '').toUpperCase();
  if (s === 'SCHEDULED') return 'pending';
  if (s === 'IN_PROGRESS') return 'in_progress';
  if (s === 'CANCELLED') return 'cancelled';
  return s.toLowerCase();
};

const AdminSpecialPickupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [allPickups, setAllPickups] = useState([]);
  const [filteredPickups, setFilteredPickups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collectors, setCollectors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState('');

  useEffect(() => {
    fetchAll(); fetchCollectors();
  }, []);
  useEffect(() => {
    let f = [...allPickups];
    if (statusFilter !== 'all') f = f.filter(p => toUiStatus(p.status) === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      f = f.filter(p =>
        String(p.pickupId||'').toLowerCase().includes(term) ||
        String(p.userId||'').toLowerCase().includes(term) ||
        String(p.description||'').toLowerCase().includes(term) ||
        String(p.location||'').toLowerCase().includes(term)
      );
    }
    setFilteredPickups(f);
  }, [allPickups, searchTerm, statusFilter]);

  const user = JSON.parse(localStorage.getItem('userData') || '{}');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const r = await authFetch(`/api/pickups/all`, { userId: user.id });
      if (r.ok) setAllPickups(await r.json());
    } finally { setLoading(false); }
  };

  const fetchCollectors = async () => {
    try {
      const r = await authFetch(`/api/users`, { userId: user.id });
      if (r.ok) {
        const all = await r.json();
        setCollectors((all||[]).filter(u => String(u.role).toUpperCase() === 'COLLECTOR'));
      }
    } catch {}
  };

  const approveAssign = async (pickupId, currentPrice) => {
    if (!selectedCollectorId) return alert('Select a collector');
    const s = prompt('Enter price (LKR)', String(Number(currentPrice||0).toFixed(2)));
    if (s === null) return;
    const price = Number(s);
    if (!Number.isFinite(price) || price <= 0) return alert('Invalid price');
    try {
      setLoading(true);
      const r = await authFetch(`/api/pickups/${pickupId}/approve-assign`, {
        method: 'PUT',
        userId: user.id,
        body: { crewId: selectedCollectorId, price }
      });
      if (!r.ok) throw new Error(await r.text());
      alert('Approved & assigned. Outstanding updated.');
      setShowModal(false);
      setSelected(null); setSelectedCollectorId('');
      await fetchAll();
    } catch (e) {
      alert(e.message || 'Approve failed');
    } finally { setLoading(false); }
  };

  const updateStatus = async (pickupId, uiStatus, notes) => {
    // admin reject / move statuses without charges
    const map = { pending:'SCHEDULED', approved:'APPROVED', in_progress:'IN_PROGRESS', completed:'COMPLETED', cancelled:'CANCELLED', rejected:'CANCELLED' };
    try {
      setLoading(true);
      const r = await authFetch(`/api/pickups/${pickupId}/status`, {
        method: 'PUT', userId: user.id, body: { status: map[uiStatus] || uiStatus.toUpperCase(), notes }
      });
      if (!r.ok) throw new Error(await r.text());
      alert('Status updated'); setShowModal(false); await fetchAll();
    } catch (e) { alert(e.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const assignOnly = async (pickupId) => {
    if (!selectedCollectorId) return alert('Select a collector');
    try {
      setLoading(true);
      const r = await authFetch(`/api/pickups/${pickupId}/assign?crewId=${encodeURIComponent(selectedCollectorId)}`, {
        method: 'PUT', userId: user.id
      });
      if (!r.ok) throw new Error(await r.text());
      alert('Assigned (no charge)'); setShowModal(false); await fetchAll();
    } catch (e) { alert(e.message || 'Assign failed'); }
    finally { setLoading(false); }
  };

  const statusClass = (ui) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }[ui] || 'bg-gray-100 text-gray-800');

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">


        {/* filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Search by pickupId, userId, location…"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {['all','pending','approved','in_progress','completed','cancelled'].map(s =>
                <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <FaFilter className="w-4 h-4" /> {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPickups.map(p => {
                  const ui = toUiStatus(p.status);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.pickupId || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {p.pickupDate} {p.pickupTime && `at ${p.pickupTime}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(ui)}`}>{ui}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {Number(p.price||0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-emerald-600 hover:text-emerald-900 mr-3"
                          onClick={() => { setSelected(p); setShowModal(true); setSelectedCollectorId(''); }}
                          title="View / Manage"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        {ui === 'pending' && (
                          <>
                            <button
                              onClick={() => { setSelected(p); if (!selectedCollectorId) return setShowModal(true); approveAssign(p.id, p.price); }}
                              className="text-green-600 hover:text-green-900 mr-2" title="Approve & Assign">
                              <FaCheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:') || '';
                                updateStatus(p.id, 'rejected', reason);
                              }}
                              className="text-red-600 hover:text-red-900" title="Reject">
                              <FaTimesCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                )})}
              </tbody>
            </table>

            {filteredPickups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaCalendarAlt className="text-gray-400 text-3xl mx-auto mb-2" />
                No pickups match your filters
              </div>
            )}
          </div>
        </div>

        {/* modal */}
        {showModal && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-xl w-full">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pickup {selected.pickupId || selected.id}</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-500">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><div className="text-gray-500">User</div><div className="font-medium">{selected.userId}</div></div>
                  <div><div className="text-gray-500">Waste</div><div className="font-medium">{selected.wasteType}</div></div>
                  <div><div className="text-gray-500">Date</div><div className="font-medium">{selected.pickupDate} {selected.pickupTime && `at ${selected.pickupTime}`}</div></div>
                  <div><div className="text-gray-500">Price</div><div className="font-medium">LKR {Number(selected.price||0).toFixed(2)}</div></div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Collector</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCollectorId}
                      onChange={e => setSelectedCollectorId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select a collector</option>
                      {collectors.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
                    </select>
                    <button
                      onClick={() => assignOnly(selected.id)}
                      disabled={!selectedCollectorId}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white">
                      Assign (no charge)
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {toUiStatus(selected.status) === 'pending' && (
                    <>
                      <button
                        onClick={() => approveAssign(selected.id, selected.price)}
                        disabled={!selectedCollectorId}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white">
                        Approve & Assign (add charge)
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:') || '';
                          updateStatus(selected.id, 'rejected', reason);
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white">
                        Reject
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-600 text-white">
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