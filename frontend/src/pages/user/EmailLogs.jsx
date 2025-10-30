import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
// import api from '../../config/api';
import { ArrowLeft, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

const EmailLogs = () => {
  const { invoiceId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmailLogs();
  }, [invoiceId]);

  const fetchEmailLogs = async () => {
    try {
    //   const response = await api.get(`/email/logs/${invoiceId}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'bg-green-900 text-green-300';
      case 'failed': return 'bg-red-900 text-red-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/user/invoices/${invoiceId}`} className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Invoice
        </Link>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Email Logs</h1>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{logs.length}</span>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No email logs found for this invoice</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {logs.map((log, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{log.type || 'Email'}</h3>
                          <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-400">
                            <span className="font-medium">To:</span> {log.recipient}
                          </p>
                          <p className="text-gray-400">
                            <span className="font-medium">Subject:</span> {log.subject}
                          </p>
                          <p className="text-gray-400">
                            <span className="font-medium">Sent at:</span>{' '}
                            {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'N/A'}
                          </p>
                          {log.error && (
                            <p className="text-red-400">
                              <span className="font-medium">Error:</span> {log.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailLogs;