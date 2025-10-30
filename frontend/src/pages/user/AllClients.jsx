import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import api from '../../config/api';
import { Users, Mail, Phone, MapPin, ArrowLeft, UserPlus } from 'lucide-react';

const AllClients = () => {
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.message || '');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchClients = async () => {
    try {
    //   const response = await api.get('/user/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/user/dashboard" className="inline-flex items-center text-blue-400 hover:text-blue-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <Link to="/client/register" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <UserPlus className="w-5 h-5 mr-2" />
            Add New Client
          </Link>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
            {message}
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">All Clients</h1>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{clients.length}</span>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No clients found</p>
              <Link to="/client/register" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Your First Client
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {clients.map((client) => (
                <div key={client._id} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-semibold text-white">{client.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-gray-400">
                          <Mail className="w-4 h-4 mr-2" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          {client.phone}
                        </div>
                      </div>
                      {client.address && (
                        <div className="flex items-start text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{client.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className="px-3 py-1 bg-green-900 text-green-300 text-xs rounded-full">Active</span>
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

export default AllClients;