import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Mail,
  Edit,
  Trash2,
  FileText,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { getInvDetails, deleteInv } from "../../apis/invoice.apis.js";
import {
  sendInvoice,
  sendPaymentReminder,
  sendPaymentConfirmation,
} from "../../apis/email.apis.js";
import { changeInvStatus } from "../../apis/invoice.apis.js";
import { generateInvoicePDF, downloadInvoicePDF } from "../../apis/pdf.api.js";
import PaymentConfirmationModal from "../../components/PaymentConfirmationModal.jsx";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal.jsx";
import GeneratePdfModal from "../../components/GeneratePdfModal.jsx";
import { toast } from "react-toastify";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratePdfModalOpen, setIsGeneratePdfModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const token = Cookies.get("token");

      const response = await axios.get(`${getInvDetails}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Single Invoice Data:\n ", response.data);

      setInvoice(response.data.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    setActionLoading(true);
    try {
      const token = Cookies.get("token");

      const response = await axios.post(
        `${sendInvoice}/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Send invoice success:\n ", response.data);

      toast.success("Invoice Sent Successfully!");
    } catch (error) {
      toast.error("Failed to Send Invoice: " + error.response.data.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminder = async () => {
    setActionLoading(true);
    try {
      const token = Cookies.get("token");

      const response = await axios.post(
        `${sendPaymentReminder}/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Send invoice reminder success:\n ", response.data);

      toast.success("Invoice Reminder Sent Successfully!");
    } catch (error) {
      toast.error("Failed to send invoice: " + error.response.data.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setActionLoading(true);
    try {
      const token = Cookies.get("token");

      const body = {
        paymentAmount: parseFloat(paymentAmount),
        paymentMethod,
        transactionId,
      }

      const response = await axios.post(
        `${sendPaymentConfirmation}/${id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Send payment confirmation success:\n ", response.data);

      setIsPaymentModalOpen(false);
      window.location.reload();
      setPaymentAmount("");
      setPaymentMethod("");

      toast.success("Invoice Payment Confirmed Successfully!");
    } catch (error) {
      toast.error("Failed to Confirm Payment: " + error.response.data.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const token = Cookies.get("token");

      const body = {
        status: newStatus,
      }

      const response = await axios.put(
        `${changeInvStatus}/${id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Update invoice status success:\n ", response.data);
      setInvoice((prev) => ({ ...prev, status: newStatus }));
      toast.success("Invoice status updated successfully!");
      
    } catch (error) {
      console.log("Error updating invoice status:", error);
      toast.error("Failed to update invoice status: " + error.response.data.message);
    
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = Cookies.get("token");

      const response = await axios.get(
        `${downloadInvoicePDF}/${id}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const cd = response.headers['content-disposition'] || '';
      let filename = `invoice-${id}.pdf`;
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
        `${generateInvoicePDF}/${id}`,
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
  };

  // const handleRegeneratePDF = async () => {
  //   setActionLoading(true);
  //   try {
  //     await api.put(`/pdf/regenerate/${id}`);
  //     setMessage("PDF regenerated successfully!");
  //     setTimeout(() => setMessage(""), 3000);
  //   } catch (error) {
  //     alert("Failed to regenerate PDF");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

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
      toast.error("Failed to delete invoice: " + error.response);
      console.error("Error fetching invoice stats:", error);
    }
  };

  const handleDeleteClick = () => {
    console.log("Deleting item:", id);
    setSelectedItem(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteInvoice(selectedItem);
      setIsModalOpen(false);
            
      setLoading(true);
      navigate("/user/invoices");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/user/invoices"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Invoices
        </Link>

        {message && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
            {message}
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">
                Invoice #{invoice.invoiceNumber}
              </h1>
              <span
                className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                  invoice.status
                )}`}
              >
                {invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1) || "N/A"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadPDF}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Client Information
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium mr-2">Name:</span>{" "}
                    {invoice.clientId?.company.name}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium mr-2">Email:</span>{" "}
                    {invoice.clientId?.email}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium mr-2">GST No.:</span>{" "}
                    {invoice.clientId?.company.gstNo}
                  </p>
                  {invoice.clientId?.company.address && (
                    <p className="text-gray-300">
                      <span className="font-medium mr-2">Address:</span>{" "}
                      {invoice.clientId?.company.address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Invoice Details
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium mr-2">Issue Date:</span>{" "}
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium mr-2">Due Date:</span>{" "}
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium mr-2">Total:</span> $
                    {invoice.totalAmount
                      ? invoice.totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Invoice Items
              </h3>

              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <table className="w-full text-base">
                  {/* ===== Table Head ===== */}
                  <thead className="bg-gray-700/70">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  {/* ===== Table Body ===== */}
                  <tbody className="divide-y divide-gray-700/60">
                    {invoice.items?.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-700/40 transition-colors text-[15px]"
                      >
                        <td className="px-6 py-3 text-gray-100">
                          {item.description}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-300">
                          $
                          {item.rate?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-100 font-semibold">
                          $
                          {item.amount?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* ===== Table Footer ===== */}
                  <tfoot className="bg-gray-700/60 text-[15px]">
                    {/* Subtotal */}
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-3 text-right text-gray-300 font-medium"
                      >
                        Subtotal
                      </td>
                      <td className="px-6 py-3 text-right text-white font-semibold">
                        $
                        {invoice.subtotal?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>

                    {/* Tax */}
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-3 text-right text-gray-300 font-medium"
                      >
                        Tax
                      </td>
                      <td className="px-6 py-3 text-right text-white font-semibold">
                        $
                        {invoice.taxAmount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>

                    {/* Discount */}
                    {invoice.discountAmount > 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-3 text-right text-gray-300 font-medium"
                        >
                          Discount
                        </td>
                        <td className="px-6 py-3 text-right text-green-400 font-semibold">
                          − $
                          {invoice.discountAmount?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    )}

                    {/* Grand Total */}
                    <tr className="bg-gray-800 border-t border-gray-600">
                      <td
                        colSpan="3"
                        className="px-6 py-4 text-right text-lg font-bold text-white"
                      >
                        Total
                      </td>
                      <td className="px-6 py-4 text-right text-lg font-bold text-blue-400">
                        $
                        {invoice.totalAmount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {invoice.notes && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300">{invoice.notes}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSendInvoice}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Invoice
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Reminder
                </button>
                {/* <button
                  onClick={handleRegeneratePDF}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Regenerate PDF
                </button> */}
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Payment
                </button>

                {/* Modal */}
                <PaymentConfirmationModal
                  isOpen={isPaymentModalOpen}
                  onClose={() => setIsPaymentModalOpen(false)}
                  onConfirm={handleConfirmPayment}
                  paymentAmount={paymentAmount}
                  setPaymentAmount={setPaymentAmount}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  transactionId={transactionId}
                  setTransactionId={setTransactionId}
                  actionLoading={actionLoading}
                />
                <Link
                  to={`/user/email-logs/${id}`}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View Email Logs
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Update Status
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleStatusChange("draft")}
                  disabled={actionLoading || invoice.status === "draft"}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Draft
                </button>
                <button
                  onClick={() => handleStatusChange("sent")}
                  disabled={actionLoading || invoice.status === "sent"}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Pending
                </button>
                <button
                  onClick={() => handleStatusChange("paid")}
                  disabled={actionLoading || invoice.status === "paid"}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => handleStatusChange("overdue")}
                  disabled={actionLoading || invoice.status === "overdue"}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Overdue
                </button>
              </div>
            </div>
          </div>
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

export default InvoiceDetails;
