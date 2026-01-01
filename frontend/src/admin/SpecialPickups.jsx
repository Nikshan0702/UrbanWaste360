import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaTrash, FaExclamationTriangle, FaRecycle, FaLaptop, FaBatteryFull,
  FaCamera, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaMoneyBillWave,
  FaUpload, FaCalendarDay, FaArrowLeft, FaArrowRight
} from 'react-icons/fa';
import { authFetch, API } from '../api';

const SpecialPickupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [scheduledPickups, setScheduledPickups] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [walletBalance, setWalletBalance] = useState(0);
  const [outstanding, setOutstanding]     = useState(0);
  const [cardToken, setCardToken]         = useState('');

  const [formData, setFormData] = useState({
    wasteType: 'bulky',
    pickupDate: '',
    pickupTime: '',
    description: '',
    location: '',
    photos: [],
    specialInstructions: '',
    urgency: 'normal'
  });

  const wasteTypes = [
    { id: 'bulky', name: 'Bulky Items', icon: FaTrash, description: 'Furniture, mattresses, large appliances', price: 500, requiresPhoto: true },
    { id: 'hazardous', name: 'Hazardous Waste', icon: FaExclamationTriangle, description: 'Chemicals, batteries, paint', price: 800, requiresPhoto: true },
    { id: 'e_waste', name: 'E-Waste', icon: FaLaptop, description: 'Electronics, phones, cables', price: 300, requiresPhoto: false },
    { id: 'recyclable', name: 'Recyclables', icon: FaRecycle, description: 'Bulk recyclables', price: 200, requiresPhoto: false },
    { id: 'batteries', name: 'Batteries', icon: FaBatteryFull, description: 'Batteries', price: 150, requiresPhoto: false }
  ];
  const urgencyLevels = [
    { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800', priceMultiplier: 1.0 },
    { id: 'normal', name: 'Normal', color: 'bg-blue-100 text-blue-800', priceMultiplier: 1.2 },
    { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-800', priceMultiplier: 1.5 },
    { id: 'emergency', name: 'Emergency', color: 'bg-red-100 text-red-800', priceMultiplier: 2.0 },
  ];
  const timeSlots = [
    '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
    '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00',
  ];

  // map BE -> UI label
  const toUiStatus = (s) => {
    const t = String(s || '').toUpperCase();
    if (t === 'SCHEDULED') return 'pending';
    if (t === 'IN_PROGRESS') return 'in_progress';
    if (t === 'CANCELLED') return 'cancelled';
    return t.toLowerCase();
  };
  const statusColor = (ui) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800'
  }[ui] || 'bg-gray-100 text-gray-800');

  useEffect(() => {
    fetchScheduledPickups();
    refreshPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshPayments = async () => {
    await Promise.all([fetchWallet(), fetchOutstanding()]);
  };

  const fetchScheduledPickups = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      const r = await authFetch(`/api/pickups/user/${user.id}`, { userId: user.id });
      if (r.ok) setScheduledPickups(await r.json());
    } catch {}
  };

  const fetchWallet = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      const r = await authFetch(`/api/payments/wallet`, { userId: user.id });
      if (r.ok) {
        const data = await r.json();
        setWalletBalance(Number(data.balance || 0));
      }
    } catch {}
  };

  const fetchOutstanding = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      const r = await authFetch(`/api/payments/outstanding`, { userId: user.id });
      if (r.ok) {
        const data = await r.json();
        setOutstanding(Number(data.outstanding || 0));
      }
    } catch {}
  };

  // calendar helpers
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const isWeekend = (d) => [0,6].includes(d.getDay());
  const isPast = (d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; };
  const navigateMonth = (dir) => setCurrentMonth(prev => {
    const n = new Date(prev); n.setMonth(prev.getMonth() + dir); return n;
  });

  const renderCalendar = () => {
    const days = [];
    const total = getDaysInMonth(currentMonth);
    const first  = getFirstDay(currentMonth);
    for (let i=0;i<first;i++) days.push(<div key={`x-${i}`} className="h-12" />);
    for (let d=1; d<=total; d++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      const ds = date.toISOString().split('T')[0];
      const disabled = isPast(date) || isWeekend(date);
      const selected = formData.pickupDate === ds;
      days.push(
        <div
          key={d}
          className={[
            "h-12 flex items-center justify-center border rounded-lg cursor-pointer transition",
            selected ? "bg-emerald-500 text-white border-emerald-600 shadow"
                     : disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300"
          ].join(' ')}
          onClick={() => !disabled && setFormData(f => ({...f, pickupDate: ds, pickupTime: ''}))}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 5) return alert('Max 5 photos');
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setFormData(prev => ({...prev, photos: [...prev.photos, ...newPhotos]}));
  };
  const removePhoto = (id) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => {
        if (p.id === id) URL.revokeObjectURL(p.preview);
        return p.id !== id;
      })
    }));
  };

  const calculatePrice = () => {
    const wt = wasteTypes.find(w => w.id === formData.wasteType);
    const ug = urgencyLevels.find(u => u.id === formData.urgency);
    if (!wt || !ug) return 0;
    return Math.round(wt.price * ug.priceMultiplier);
  };

  const validate = () => {
    setError('');
    const wt = wasteTypes.find(w => w.id === formData.wasteType);
    if (!formData.pickupDate || !formData.pickupTime) return setError('Select date & time'), false;
    if (!formData.description.trim()) return setError('Enter description'), false;
    if (wt?.requiresPhoto && formData.photos.length === 0) return setError('Photos required for this type'), false;
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(''); setSuccess('');

    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      const body = {
        userId: user.id,
        wasteType: formData.wasteType,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        description: formData.description,
        location: formData.location || user.address,
        specialInstructions: formData.specialInstructions,
        urgency: formData.urgency,
        price: calculatePrice(),
        // NOTE: status is NOT sent; backend sets SCHEDULED
      };
      const r = await authFetch(`/api/pickups/schedule`, { method: 'POST', userId: user.id, body });
      if (!r.ok) throw new Error(await r.text());
      const res = await r.json();
      setSuccess(`Pickup requested! ID: ${res.pickupId}. Awaiting approval.`);
      setFormData({
        wasteType: 'bulky', pickupDate: '', pickupTime: '', description: '',
        location: '', photos: [], specialInstructions: '', urgency: 'normal'
      });
      await Promise.all([fetchScheduledPickups(), refreshPayments()]);
    } catch (e) {
      setError(e.message || 'Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  const cancelPickup = async (id) => {
    if (!window.confirm('Cancel this pickup?')) return;
    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      const r = await authFetch(`/api/pickups/${id}/cancel`, { method: 'PUT', userId: user.id });
      if (!r.ok) throw new Error(await r.text());
      setSuccess('Pickup cancelled');
      await Promise.all([fetchScheduledPickups(), refreshPayments()]);
    } catch (e) { setError(e.message || 'Cancel failed'); }
  };

  const settle = async (method) => {
    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      const body = method === 'wallet'
        ? { method: 'WALLET', amount: outstanding }
        : { method: 'CARD', amount: outstanding, cardToken };
      const r = await authFetch(`/api/payments/settle`, { method: 'POST', userId: user.id, body });
      if (!r.ok) throw new Error(await r.text());
      setSuccess(`Payment completed with ${method.toLowerCase()}`);
      setCardToken('');
      await refreshPayments();
    } catch (e) { setError(e.message || 'Payment failed'); }
  };

  // UI bits omitted for brevity comments; structure matches your previous UI
  const selectedWasteType = wasteTypes.find(w => w.id === formData.wasteType);
  const selectedUrgency   = urgencyLevels.find(u => u.id === formData.urgency);
  const availableTimes    = timeSlots;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Special Waste Pickup</h1>
          <p className="text-gray-600 text-lg">Request pickups for bulky, hazardous, or special waste items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waste selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaTrash className="text-emerald-600" /> Select Waste Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wasteTypes.map(w => {
                  const Icon = w.icon; const sel = formData.wasteType === w.id;
                  return (
                    <button key={w.id}
                      onClick={() => setFormData(f => ({...f, wasteType: w.id}))}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${sel ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${sel ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{w.name}</h3>
                            {sel && <FaCheckCircle className="text-emerald-500" />}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{w.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">{w.requiresPhoto && '📷 Photos required'}</span>
                            <span className="font-semibold text-emerald-600">LKR {w.price}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date/Time */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-emerald-600" /> Select Pickup Date & Time
              </h2>

              <button
                onClick={() => setShowCalendar(s => !s)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 mb-4">
                <FaCalendarDay className="text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {formData.pickupDate ? 'Change Date' : 'Select Pickup Date'}
                </span>
              </button>

              {showCalendar && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaArrowLeft className="text-gray-600" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaArrowRight className="text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} className="text-center text-sm font-semibold text-gray-600 py-2">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendar()}
                  </div>
                </div>
              )}

              {formData.pickupDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Time Slot</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableTimes.map(t => (
                      <button key={t}
                        onClick={() => setFormData(f => ({...f, pickupTime: t}))}
                        className={`p-3 border-2 rounded-lg ${formData.pickupTime===t ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pickup Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(f => ({...f, description: e.target.value}))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Describe the items (size, quantity, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(f => ({...f, location: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter location or leave blank to use address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={e => setFormData(f => ({...f, specialInstructions: e.target.value}))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Any special instructions for the crew…"
                  />
                </div>
              </div>
            </div>

            {/* Photo upload (if required) */}
            {selectedWasteType?.requiresPhoto && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCamera className="text-emerald-600" /> Upload Photos (Required)
                </h2>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload photos (up to 5)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoUpload} />
                </label>
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                    {formData.photos.map(p => (
                      <div key={p.id} className="relative group">
                        <img alt="" src={p.preview} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => removePhoto(p.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <FaTimesCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: summary + payments */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pickup Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Waste Type</span><span className="font-semibold">{selectedWasteType?.name}</span></div>
                <div className="flex justify-between"><span>Base Price</span><span className="font-semibold">LKR {selectedWasteType?.price}</span></div>
                <div className="flex justify-between"><span>Urgency</span><span className="font-semibold">{selectedUrgency?.name} ({selectedUrgency?.priceMultiplier}x)</span></div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Price</span><span className="text-emerald-600">LKR {calculatePrice()}</span>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.pickupDate || !formData.pickupTime}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold mt-4">
                  {loading ? 'Submitting…' : <>Request Pickup – LKR {calculatePrice()}</>}
                </button>
              </div>
            </div>

            {/* Your Pickups */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Pickup Requests</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scheduledPickups.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No pickup requests</div>
                ) : scheduledPickups.map(p => {
                  const ui = toUiStatus(p.status);
                  return (
                    <div key={p.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{(wasteTypes.find(w => w.id===p.wasteType)?.name) || p.wasteType}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(ui)}`}>{ui}</span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FaCalendarAlt className="w-3 h-3" />
                        {p.pickupDate} {p.pickupTime && `at ${p.pickupTime}`}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">LKR {Number(p.price||0).toFixed(2)}</span>
                        {['pending','approved'].includes(ui) && (
                          <button onClick={() => cancelPickup(p.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-600" /> Payments
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span>Wallet Balance</span><span className="font-semibold">LKR {walletBalance.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Outstanding</span><span className="font-semibold text-red-600">LKR {outstanding.toFixed(2)}</span></div>
                <input
                  type="text"
                  value={cardToken}
                  onChange={(e) => setCardToken(e.target.value)}
                  placeholder="Card token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => settle('wallet')} disabled={outstanding <= 0}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold">
                    Pay with Wallet
                  </button>
                  <button onClick={() => settle('card')} disabled={outstanding <= 0}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">
                    Pay with Card
                  </button>
                </div>
                <button onClick={refreshPayments} className="w-full border border-gray-300 hover:border-emerald-400 text-gray-700 py-2 rounded-lg font-medium">
                  Refresh Balances
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* messages */}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6 text-red-700">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 text-green-700">{success}</div>}
      </div>
    </div>
  );
};

export default SpecialPickupComponent;