import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, DollarSign, Clock, LogOut, User, Eye } from 'lucide-react';
import { getClientDashboard, getClientProfile } from "../../apis/client.apis.js";
import Cookies from "js-cookie";
import axios from "axios";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysUntil = (dueDate) => {
    if (!dueDate) return Infinity;
    const now = new Date();
    const due = new Date(dueDate);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffMs = startOfDue - startOfToday;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = Cookies.get("token");
      console.log("Token: ", token);

      const response = await axios.get(getClientDashboard, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Client Dashboard Data:", response.data);
      
      setDashboard(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    navigate('/client/login');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-900 text-green-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      case 'overdue': return 'bg-red-900 text-red-300';
      case 'draft': return 'bg-gray-700 text-gray-300';
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
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="w-6 h-6 text-green-500" />
              <span className="text-white text-xl font-bold">Client Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/client/profile" className="text-gray-300 hover:text-white flex items-center space-x-2">
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-400">Here's an overview of your invoices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Invoices</p>
            <p className="text-3xl font-bold text-white">{dashboard?.stats.totalInvoices || 0}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-600 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Pending Payment</p>
            <p className="text-3xl font-bold text-white">${dashboard?.stats.pendingAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-white">${dashboard?.stats.totalAmountPaid?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-xl font-bold text-white">Recent Invoices</h2>
          </div>

          {!dashboard?.recentInvoices || dashboard.recentInvoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Remaining Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {dashboard.recentInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 text-white font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-white font-medium">{invoice.userId.businessDetails.companyName}</td>
                      <td className="px-6 py-4 text-white font-semibold">${invoice.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-white font-semibold">${invoice.remainingAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/client/invoice/${invoice._id}`}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Upcoming Due Dates (uses backend data) */}
        <div className="md:col-span-3">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4 ">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-600 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Upcoming Due Dates</h3>
              </div>
              <div className="text-sm text-gray-400">{(dashboard.upcomingDueDates || []).length} items</div>
            </div>

            {(!dashboard.upcomingDueDates || dashboard.upcomingDueDates.length === 0) ? (
              <div className="text-center py-6 text-gray-400">No upcoming due dates</div>
            ) : (
              <ul className="space-y-3">
                {dashboard.upcomingDueDates.map(invoice => {
                  const du = daysUntil(invoice.dueDate);
                  const badgeClass =
                    du < 0 ? 'bg-red-600 text-white' :
                    du <= 3 ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white';

                  return (
                    <li key={invoice._id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3 border border-gray-600">
                      <div>
                        <div className="text-white font-medium">{invoice.invoiceNumber} • {invoice.userId?.businessDetails?.companyName}</div>
                        <div className="text-sm text-gray-400">${(invoice.remainingAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm ${badgeClass} mr-8`}>
                          {du < 0 ? `Overdue ${Math.abs(du)}d` : du === 0 ? 'Due today' : `Due in ${du}d`}
                        </div>
                        <div>
                        <Link
                          to={`/client/invoice/${invoice._id}`}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ClientDashboard;