import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import api from '../../config/api';
import { LayoutDashboard, FileText, Users, DollarSign, TrendingUp, LogOut, User } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
    //   const response = await api.get('/user/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/user/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="w-6 h-6 text-blue-500" />
              <span className="text-white text-xl font-bold">Invoice Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/user/profile" className="text-gray-300 hover:text-white flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="text-gray-300 hover:text-white flex items-center space-x-2">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Invoices</p>
            <p className="text-3xl font-bold text-white">{dashboard?.totalInvoices || 0}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">${dashboard?.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Pending Amount</p>
            <p className="text-3xl font-bold text-white">${dashboard?.pendingAmount?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Clients</p>
            <p className="text-3xl font-bold text-white">{dashboard?.totalClients || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Link to="/user/invoices" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <FileText className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Manage Invoices</h3>
            <p className="text-gray-400">View, create, and manage all your invoices</p>
          </Link>

          <Link to="/user/clients" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
            <Users className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Manage Clients</h3>
            <p className="text-gray-400">View and manage your client database</p>
          </Link>

          <Link to="/user/invoices/create" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
            <DollarSign className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Create Invoice</h3>
            <p className="text-gray-400">Generate a new invoice for your clients</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;