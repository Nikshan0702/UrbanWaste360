import React, { useState, useEffect } from 'react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState('user123'); // You can get this from auth context

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/payments/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        console.error('Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return '💰';
      case 'expense':
        return '💳';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1 text-sm">View all your transactions</p>
        </div>

        {/* Refresh Button */}
        <div className="mb-6 text-right">
          <button
            onClick={fetchPaymentHistory}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Payment History List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">Your payment history will appear here once you make transactions.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">{getTypeIcon(payment.type)}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {payment.description}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(payment.createdAt)}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-lg font-semibold ${
                        payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.type === 'income' ? '+' : '-'}LKR {Math.abs(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">ID: {payment.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {payments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  LKR {payments.filter(p => p.type === 'income').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Income</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  LKR {payments.filter(p => p.type === 'expense').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Expenses</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {payments.length}
                </p>
                <p className="text-sm text-gray-600">Total Transactions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
