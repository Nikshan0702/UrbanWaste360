import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle,
  FaEye,
  FaCheck,
  FaComment,
  FaMapMarkerAlt,
  FaFileAlt,
  FaClock,
  FaTimesCircle,
  FaTrash,
  FaRecycle
} from 'react-icons/fa';

const FeedbackIssuesComponent = ({ userData }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueStatusFilter, setIssueStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.role === 'collector') {
      fetchAllIssues();
      fetchIssueStatistics();
    }
  }, [userData]);

  const fetchAllIssues = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/issues/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const issuesData = await response.json();
        setIssues(issuesData);
      } else {
        throw new Error('Failed to fetch issues');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setError('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueStatistics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/issues/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const statistics = await response.json();
        setStats({
          total: statistics.totalIssues,
          pending: statistics.pendingIssues,
          inProgress: statistics.inProgressIssues,
          resolved: statistics.resolvedIssues
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: `Status updated to ${newStatus}`
        })
      });

      if (response.ok) {
        // Refresh issues and statistics
        await fetchAllIssues();
        await fetchIssueStatistics();
        setSelectedIssue(null);
      } else {
        throw new Error('Failed to update issue status');
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
      setError('Failed to update issue status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FaClock className="w-3 h-3" />;
      case 'IN_PROGRESS': return <FaEye className="w-3 h-3" />;
      case 'RESOLVED': return <FaCheck className="w-3 h-3" />;
      default: return <FaClock className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MISSED_PICKUP': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'BROKEN_BIN': return <FaTrash className="w-4 h-4" />;
      case 'OVERFLOW': return <FaRecycle className="w-4 h-4" />;
      case 'COMPLAINT': return <FaComment className="w-4 h-4" />;
      case 'SUGGESTION': return <FaFileAlt className="w-4 h-4" />;
      default: return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'MISSED_PICKUP': return 'bg-red-100 text-red-600';
      case 'BROKEN_BIN': return 'bg-orange-100 text-orange-600';
      case 'OVERFLOW': return 'bg-yellow-100 text-yellow-600';
      case 'COMPLAINT': return 'bg-blue-100 text-blue-600';
      case 'SUGGESTION': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredIssues = issues.filter(issue => 
    issueStatusFilter === 'ALL' || issue.status === issueStatusFilter
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userData?.role !== 'collector') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Denied</h3>
          <p className="text-gray-600">This section is only available for collector staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Feedback & Issue Management</h1>
        <p className="text-gray-600">Manage and track resident-reported issues and feedback</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Issues</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <FaExclamationTriangle className="text-blue-200 text-2xl" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Review</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <FaClock className="text-yellow-200 text-2xl" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolved</p>
              <p className="text-3xl font-bold">{stats.resolved}</p>
            </div>
            <FaCheck className="text-green-200 text-2xl" />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <h3 className="text-lg font-semibold text-gray-800">Filter Issues:</h3>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(status => (
            <button
              key={status}
              onClick={() => setIssueStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                issueStatusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Issues ({filteredIssues.length})
            </h2>
            <button
              onClick={fetchAllIssues}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="p-8 text-center">
              <FaFileAlt className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No issues found for the selected filter.</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div 
                key={issue.id} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${getCategoryColor(issue.category)}`}>
                      {getCategoryIcon(issue.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {issue.category.replace('_', ' ')}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {getStatusIcon(issue.status)}
                          <span className="ml-1">{issue.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Reported: {formatDate(issue.createdAt)}</span>
                        {issue.location && (
                          <span className="flex items-center">
                            <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                            {issue.location}
                          </span>
                        )}
                        {issue.isAnonymous && (
                          <span className="text-blue-600">Anonymous Report</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onStatusUpdate={updateIssueStatus}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Issue Detail Modal Component
const IssueDetailModal = ({ issue, onClose, onStatusUpdate }) => {
  if (!issue) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FaClock className="w-3 h-3" />;
      case 'IN_PROGRESS': return <FaEye className="w-3 h-3" />;
      case 'RESOLVED': return <FaCheck className="w-3 h-3" />;
      default: return <FaClock className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MISSED_PICKUP': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'BROKEN_BIN': return <FaTrash className="w-4 h-4" />;
      case 'OVERFLOW': return <FaRecycle className="w-4 h-4" />;
      case 'COMPLAINT': return <FaComment className="w-4 h-4" />;
      case 'SUGGESTION': return <FaFileAlt className="w-4 h-4" />;
      default: return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'MISSED_PICKUP': return 'bg-red-100 text-red-600';
      case 'BROKEN_BIN': return 'bg-orange-100 text-orange-600';
      case 'OVERFLOW': return 'bg-yellow-100 text-yellow-600';
      case 'COMPLAINT': return 'bg-blue-100 text-blue-600';
      case 'SUGGESTION': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Issue Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Issue Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${getCategoryColor(issue.category)}`}>
                {getCategoryIcon(issue.category)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {issue.category.replace('_', ' ')}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                  {getStatusIcon(issue.status)}
                  <span className="ml-1">{issue.status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{issue.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Reported By</h4>
              <p className="text-gray-600">{issue.isAnonymous ? 'Anonymous User' : `User: ${issue.userId}`}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Reported On</h4>
              <p className="text-gray-600">{formatDate(issue.createdAt)}</p>
            </div>
            {issue.location && (
              <div className="col-span-2">
                <h4 className="font-medium text-gray-700 mb-1">Location</h4>
                <p className="text-gray-600 flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                  {issue.location}
                </p>
              </div>
            )}
          </div>

          {/* Status Update */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Update Status</h4>
            <div className="flex space-x-3">
              {issue.status !== 'IN_PROGRESS' && (
                <button
                  onClick={() => onStatusUpdate(issue.id, 'IN_PROGRESS')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark In Progress
                </button>
              )}
              {issue.status !== 'RESOLVED' && (
                <button
                  onClick={() => onStatusUpdate(issue.id, 'RESOLVED')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Resolved
                </button>
              )}
              {issue.status !== 'PENDING' && (
                <button
                  onClick={() => onStatusUpdate(issue.id, 'PENDING')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackIssuesComponent;