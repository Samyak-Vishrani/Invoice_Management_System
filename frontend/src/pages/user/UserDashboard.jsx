import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  LogOut,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Cookie,
} from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { userDashboard } from "../../apis/user.apis.js";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = Cookies.get("token");
      console.log("Token: ", token);

      const response = await axios.get(userDashboard, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User Dashboard Data:", response.data);

      setDashboard(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    navigate("/user/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const recentInvoices = dashboard?.recentInvoices || [];
  const chartData = dashboard?.chartData || {};

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="w-6 h-6 text-blue-500" />
              <span className="text-white text-xl font-bold">
                Invoice Manager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/user/profile")}
                className="text-gray-300 hover:text-white flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white flex items-center space-x-2"
              >
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
          <p className="text-gray-400">
            Welcome back! Here's your business overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Invoices</p>
            <p className="text-3xl font-bold text-white">
              {stats.totalInvoices
              ? stats.totalInvoices.toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })
              : "0.00"}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white">
              ${stats.totalRevenue
                ? stats.totalRevenue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Pending Amount</p>
            <p className="text-3xl font-bold text-white">
              ${stats.pendingAmount
              ? stats.pendingAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : "0.00"}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Clients</p>
            <p className="text-3xl font-bold text-white">
              {stats.totalClients
              ? stats.totalClients.toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })
              : "0.00"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-gray-400 text-sm">Paid Invoices</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.paidInvoices || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {chartData.paidPercentage || 0}% of total
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <p className="text-gray-400 text-sm">Unpaid Invoices</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.unpaidInvoices || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {chartData.unpaidPercentage || 0}% of total
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-gray-400 text-sm">Overdue Invoices</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.overdueInvoices || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {chartData.overduePercentage || 0}% of total
            </p>
          </div>
        </div>

        {recentInvoices.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Invoices
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Invoice No.
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="border-b border-gray-700 hover:bg-gray-750"
                    >
                      <td className="py-3 px-4 text-white">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {invoice.clientId?.company?.name || "N/A"}
                        {invoice.clientId?.company && (
                          <span className="text-gray-500 text-sm block">
                            {/* {invoice.clientId.company.name},{" "} */}
                            {invoice.clientId.company.address}, GST:{" "}
                            {invoice.clientId.company.gstNo}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white">
                        ${invoice.totalAmount
                        ? invoice.totalAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })
                        : "0.00"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-600 text-white"
                              : invoice.status === "viewed"
                              ? "bg-blue-600 text-white"
                              : invoice.status === "sent"
                              ? "bg-yellow-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/user/invoices")}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors text-left"
          >
            <FileText className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Manage Invoices
            </h3>
            <p className="text-gray-400">
              View, create, and manage all your invoices
            </p>
          </button>

          <button
            onClick={() => navigate("/user/clients")}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors text-left"
          >
            <Users className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Manage Clients
            </h3>
            <p className="text-gray-400">
              View and manage your client database
            </p>
          </button>

          <button
            onClick={() => navigate("/user/invoices/create")}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors text-left"
          >
            <DollarSign className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Create Invoice
            </h3>
            <p className="text-gray-400">
              Generate a new invoice for your clients
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
