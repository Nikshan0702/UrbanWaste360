import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaTrash, 
  FaExclamationTriangle, 
  FaRecycle, 
  FaLaptop, 
  FaBatteryFull,
  FaCamera,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaUpload,
  FaCalendarDay,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';

const SpecialPickupComponent = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [scheduledPickups, setScheduledPickups] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
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

  // Waste types with icons and descriptions
  const wasteTypes = [
    { 
      id: 'bulky', 
      name: 'Bulky Items', 
      icon: FaTrash, 
      description: 'Furniture, mattresses, large appliances',
      price: 500,
      requiresPhoto: true
    },
    { 
      id: 'hazardous', 
      name: 'Hazardous Waste', 
      icon: FaExclamationTriangle, 
      description: 'Chemicals, batteries, paint, cleaning products',
      price: 800,
      requiresPhoto: true
    },
    { 
      id: 'e_waste', 
      name: 'E-Waste', 
      icon: FaLaptop, 
      description: 'Electronics, computers, phones, cables',
      price: 300,
      requiresPhoto: false
    },
    { 
      id: 'recyclable', 
      name: 'Recyclables', 
      icon: FaRecycle, 
      description: 'Large quantities of recyclable materials',
      price: 200,
      requiresPhoto: false
    },
    { 
      id: 'batteries', 
      name: 'Batteries', 
      icon: FaBatteryFull, 
      description: 'All types of batteries',
      price: 150,
      requiresPhoto: false
    }
  ];

  // Urgency levels
  const urgencyLevels = [
    { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800', priceMultiplier: 1 },
    { id: 'normal', name: 'Normal', color: 'bg-blue-100 text-blue-800', priceMultiplier: 1.2 },
    { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-800', priceMultiplier: 1.5 },
    { id: 'emergency', name: 'Emergency', color: 'bg-red-100 text-red-800', priceMultiplier: 2 }
  ];

  // Time slots from 9:00 AM to 5:00 PM
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    if (userData?.role === 'collector') {
      fetchAllIssues();
      fetchIssueStatistics();
    }
    fetchAvailableSlots();
    fetchScheduledPickups();
  }, [userData]);

  const fetchAvailableSlots = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/pickups/available-slots', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const slots = await response.json();
        setAvailableSlots(slots);
      } else {
        // Generate mock slots if API fails
        generateMockSlots();
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      generateMockSlots();
    }
  };

  const generateMockSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) { // Show 2 weeks
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        // Randomly make some time slots unavailable for realism
        const availableTimes = timeSlots.filter(() => Math.random() > 0.3);
        if (availableTimes.length > 0) {
          slots.push({
            date: date.toISOString().split('T')[0],
            times: availableTimes
          });
        }
      }
    }
    
    setAvailableSlots(slots);
  };

  const fetchScheduledPickups = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      const response = await fetch(`http://localhost:8080/api/pickups/user/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pickups = await response.json();
        setScheduledPickups(pickups);
      }
    } catch (error) {
      console.error('Error fetching scheduled pickups:', error);
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableSlots.some(slot => slot.date === dateString);
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const handleDateSelect = (date) => {
    if (isDateInPast(date) || isWeekend(date) || !isDateAvailable(date)) return;

    const dateString = date.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      pickupDate: dateString,
      pickupTime: '' // Reset time when date changes
    }));
    setShowCalendar(false);
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({
      ...prev,
      pickupTime: time
    }));
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const currentDate = new Date();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const isPast = isDateInPast(date);
      const isWeekendDay = isWeekend(date);
      const isAvailable = isDateAvailable(date);
      const isSelected = formData.pickupDate === dateString;
      const isToday = date.toDateString() === today.toDateString();

      let className = "h-12 flex items-center justify-center border rounded-lg cursor-pointer transition-all ";
      
      if (isSelected) {
        className += "bg-emerald-500 text-white border-emerald-600 shadow-lg transform scale-105";
      } else if (isToday) {
        className += "bg-blue-100 text-blue-800 border-blue-300 font-semibold";
      } else if (isPast || isWeekendDay || !isAvailable) {
        className += "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
      } else {
        className += "bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md";
      }

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => handleDateSelect(date)}
          title={
            isPast ? "Past date" :
            isWeekendDay ? "Weekend - No service" :
            !isAvailable ? "No available slots" :
            "Click to select"
          }
        >
          <div className="text-center">
            <div className="text-sm font-medium">{day}</div>
            {isAvailable && !isPast && !isWeekendDay && (
              <div className="text-xs text-emerald-600 mt-1">Available</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getAvailableTimesForSelectedDate = () => {
    if (!formData.pickupDate) return [];
    
    const slot = availableSlots.find(s => s.date === formData.pickupDate);
    return slot ? slot.times : [];
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + formData.photos.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const removePhoto = (id) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => {
        if (photo.id === id) {
          URL.revokeObjectURL(photo.preview);
        }
        return photo.id !== id;
      })
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location');
      }
    );
  };

  const calculatePrice = () => {
    const selectedWaste = wasteTypes.find(w => w.id === formData.wasteType);
    const selectedUrgency = urgencyLevels.find(u => u.id === formData.urgency);
    
    if (!selectedWaste || !selectedUrgency) return 0;
    
    return selectedWaste.price * selectedUrgency.priceMultiplier;
  };

  const validateForm = () => {
    if (!formData.pickupDate || !formData.pickupTime) {
      setError('Please select pickup date and time');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description of the items');
      return false;
    }

    const selectedWaste = wasteTypes.find(w => w.id === formData.wasteType);
    if (selectedWaste?.requiresPhoto && formData.photos.length === 0) {
      setError('Photos are required for this waste type');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));

      const pickupData = {
        userId: userData.id,
        wasteType: formData.wasteType,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        description: formData.description,
        location: formData.location || userData.address,
        specialInstructions: formData.specialInstructions,
        urgency: formData.urgency,
        status: 'scheduled',
        price: calculatePrice()
      };

      const response = await fetch('http://localhost:8080/api/pickups/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pickupData)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Special pickup scheduled successfully! Pickup ID: ${result.pickupId}`);
        resetForm();
        await fetchScheduledPickups();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to schedule pickup');
      }
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      setError('Failed to schedule pickup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      wasteType: 'bulky',
      pickupDate: '',
      pickupTime: '',
      description: '',
      location: '',
      photos: [],
      specialInstructions: '',
      urgency: 'normal'
    });
  };

  const cancelPickup = async (pickupId) => {
    if (!confirm('Are you sure you want to cancel this pickup?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/pickups/${pickupId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Pickup cancelled successfully');
        await fetchScheduledPickups();
      } else {
        throw new Error('Failed to cancel pickup');
      }
    } catch (error) {
      console.error('Error cancelling pickup:', error);
      setError('Failed to cancel pickup');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const selectedWasteType = wasteTypes.find(w => w.id === formData.wasteType);
  const selectedUrgency = urgencyLevels.find(u => u.id === formData.urgency);
  const availableTimes = getAvailableTimesForSelectedDate();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Schedule Special Waste Pickup
          </h1>
          <p className="text-gray-600 text-lg">
            Request pickups for bulky, hazardous, or special waste items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Scheduling Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waste Type Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaTrash className="text-emerald-600" />
                Select Waste Type
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wasteTypes.map((waste) => {
                  const IconComponent = waste.icon;
                  const isSelected = formData.wasteType === waste.id;
                  
                  return (
                    <button
                      key={waste.id}
                      onClick={() => handleInputChange('wasteType', waste.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-3 rounded-lg ${
                          isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{waste.name}</h3>
                            {isSelected && <FaCheckCircle className="text-emerald-500" />}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{waste.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500">
                              {waste.requiresPhoto && '📷 Photos required'}
                            </span>
                            <span className="font-semibold text-emerald-600">
                              LKR {waste.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-emerald-600" />
                Select Pickup Date & Time
              </h2>
              
              {/* Selected Date Display */}
              {formData.pickupDate && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-800 font-semibold">
                        Selected: {formatDate(formData.pickupDate)} at {formData.pickupTime || 'No time selected'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCalendar(true)}
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Calendar Toggle */}
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <FaCalendarDay className="text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {formData.pickupDate ? 'Change Date' : 'Select Pickup Date'}
                </span>
              </button>

              {/* Calendar */}
              {showCalendar && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaArrowLeft className="text-gray-600" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaArrowRight className="text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendar()}
                  </div>
                </div>
              )}

              {/* Time Selection */}
              {formData.pickupDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Time Slot (9:00 AM - 5:00 PM)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          formData.pickupTime === time
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-25'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {availableTimes.length === 0 && (
                    <p className="text-red-600 text-sm mt-2">
                      No available time slots for this date. Please select another date.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Rest of the form components remain the same */}
            {/* Description & Location */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pickup Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the items for pickup (size, quantity, condition)..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter specific pickup location..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      onClick={getCurrentLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span>GPS</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Any special instructions for the collection crew..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            {selectedWasteType?.requiresPhoto && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCamera className="text-emerald-600" />
                  Upload Photos (Required)
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload photos</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB each</p>
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
                  
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {formData.photos.map((photo) => (
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
                            <FaTimesCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Urgency Level */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-emerald-600" />
                Urgency Level
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {urgencyLevels.map((urgency) => {
                  const isSelected = formData.urgency === urgency.id;
                  
                  return (
                    <button
                      key={urgency.id}
                      onClick={() => handleInputChange('urgency', urgency.id)}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${urgency.color} mb-2`}>
                        {urgency.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {urgency.priceMultiplier}x price
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Action */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pickup Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Waste Type:</span>
                  <span className="font-semibold">{selectedWasteType?.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-semibold">LKR {selectedWasteType?.price}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Urgency:</span>
                  <span className="font-semibold">{selectedUrgency?.name} ({selectedUrgency?.priceMultiplier}x)</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Price:</span>
                    <span className="text-emerald-600">LKR {calculatePrice()}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.pickupDate || !formData.pickupTime}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>Schedule Pickup - LKR {calculatePrice()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scheduled Pickups */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Scheduled Pickups</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scheduledPickups.length === 0 ? (
                  <div className="text-center py-4">
                    <FaCalendarAlt className="text-gray-400 text-2xl mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No scheduled pickups</p>
                  </div>
                ) : (
                  scheduledPickups.map((pickup) => (
                    <div key={pickup.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {wasteTypes.find(w => w.id === pickup.wasteType)?.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>
                          {pickup.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          {formatDate(pickup.pickupDate)} at {pickup.pickupTime}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>LKR {pickup.price}</span>
                          {pickup.status === 'scheduled' && (
                            <button
                              onClick={() => cancelPickup(pickup.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

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

export default SpecialPickupComponent;