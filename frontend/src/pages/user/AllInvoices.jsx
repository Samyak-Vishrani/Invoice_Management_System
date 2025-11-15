import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Plus,
  Eye,
  Download,
  Trash2,
  Filter,
} from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { getAllInv, getInvStats, deleteInv } from "../../apis/invoice.apis.js";
import { generateInvoicePDF, downloadInvoicePDF } from "../../apis/pdf.api.js";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal.jsx";
import GeneratePdfModal from "../../components/GeneratePdfModal.jsx";
import { toast } from "react-toastify";

const AllInvoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isGeneratePdfModalOpen, setIsGeneratePdfModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = Cookies.get("token");

      const response = await axios.get(getAllInv, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Invoice Data:\n ", response.data);

      setInvoices(response.data.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = Cookies.get("token");

      const response = await axios.get(getInvStats, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Invoice Stats:\n ", response.data);

      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
    }
  };

  const deleteInvoice = async (id) => {
    try {
      const token = Cookies.get("token");

      const response = await axios.delete(`${deleteInv}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Deleted Invoice:\n ", response.data);
      toast.success("Invoice deleted successfully");

    } catch (error) {
      toast.error("Failed to delete invoice: " + error.response.data.message);
      console.error("Error fetching invoice stats:", error);
    }
  };

  const handleDeleteClick = (invoice) => {
    console.log("Deleting item:", selectedItem);
    setSelectedItem(invoice);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteInvoice(selectedItem._id);
      setIsModalOpen(false);
            
      setLoading(true);
      fetchInvoices();
      fetchStats();

    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-900 text-green-300";
      case "pending":
        return "bg-yellow-900 text-yellow-300";
      case "overdue":
        return "bg-red-900 text-red-300";
      case "draft":
        return "bg-gray-700 text-gray-300";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  const handleDownloadPDF = async (invoice) => {
    setSelectedItem(invoice);
    console.log("In handle DownloadPDF for invoice:", invoice);
    
    try {
      const token = Cookies.get("token");

      const response = await axios.get(
        `${downloadInvoicePDF}/${invoice._id}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("PDF download response:\n ", response);
      
      const cd = response.headers['content-disposition'] || '';
      let filename = `Invoice-${invoice._id}.pdf`;
      const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/);
      if (match && match[1]) filename = decodeURIComponent(match[1]);

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    
    } catch (error) {
      console.log('Error downloading PDF:', error);
      if (error.response && error.response.status === 400) {
        setIsGeneratePdfModalOpen(true);
      } else {
        toast.error("Failed to download PDF: " + error.response?.data?.message || error.message);
      }
    }
  };

  const handleGeneratePDF = async () => {
    console.log("In handle GeneratePDF");
    try {
      const token = Cookies.get("token");

      const response = await axios.post(
        `${generateInvoicePDF}/${selectedItem._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("PDF generated successfully:\n ", response.data);
      setIsGeneratePdfModalOpen(false);
      setTimeout(toast.success("PDF generated successfully! Downloading now..."), 1200);
      
      // Trigger download after generation
      await handleDownloadPDF();

    }
    catch (error) {
      toast.error("Failed to generate PDF: " + error.response?.data?.message || error.message);
    }
  }

  const filteredInvoices =
    filter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status?.toLowerCase() === filter);

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
          <Link
            to="/user/dashboard"
            className="inline-flex items-center text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <Link
            to="/user/invoices/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Invoice
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-white">
                {stats.summary.totalInvoices}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.summary.paidInvoices}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.summary.pendingInvoices}
              </p>
            </div>
            {/* <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-400">{stats.summary.}</p>
            </div> */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-gray-400">
                {stats.summary.draftInvoices}
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">All Invoices</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            filter === "all" ? (
              <div className="px-6 py-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">No invoices found</p>
                <Link
                  to="/user/invoices/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Invoice
                </Link>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">
                  No invoices found with {filter} status
                </p>
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 text-white font-medium">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {invoice.clientId?.company.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">
                        $
                        {invoice.totalAmount
                          ? invoice.totalAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "0.00"}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1) || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/user/invoices/${invoice._id}`)
                            }
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(invoice)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedItem?.invoiceNumber || "this invoice"}
      />
      <GeneratePdfModal
        isOpen={isGeneratePdfModalOpen}
        onClose={() => setIsGeneratePdfModalOpen(false)}
        onConfirm={handleGeneratePDF}
      />
    </div>
  );
};

export default AllInvoices;
