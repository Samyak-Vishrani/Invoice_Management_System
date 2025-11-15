import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Building } from 'lucide-react';
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axios from "axios";
import { getClientInvoice } from "../../apis/client.apis.js";
import { generateInvoicePDF, downloadInvoicePDF } from "../../apis/pdf.api.js";
import GeneratePdfModal from "../../components/GeneratePdfModal.jsx";

const ViewInvoice = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratePdfModalOpen, setIsGeneratePdfModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const token = Cookies.get("token");

      const response = await axios.get(`${getClientInvoice}/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Single Invoice Data:\n ", response.data);

      setInvoice(response.data.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = Cookies.get("token");

      const response = await axios.get(
        `${downloadInvoicePDF}/${invoiceId}`,
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const cd = response.headers['content-disposition'] || '';
      let filename = `invoice-${invoiceId}.pdf`;
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
        `${generateInvoicePDF}/${invoiceId}`,
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
        <Link to="/client/dashboard" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-green-500" />
              <h1 className="text-2xl font-bold text-white">Invoice #{invoice.invoiceNumber}</h1>
              <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) || "N/A"}
              </span>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Billed From</h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <p className="text-white font-medium text-xl">{invoice.userId?.name}</p>
                  <p className="text-white font-medium text-md">{invoice.userId?.businessDetails.companyName}</p>
                  <p className="text-gray-300">{invoice.client?.email}</p>
                  <p className="text-gray-300">{invoice.userId?.businessDetails.phone}</p>
                  {invoice.userId?.businessDetails?.address && (
                    <p className="text-gray-300">{invoice.userId?.businessDetails.address}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Invoice Details</h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invoice Number:</span>
                    <span className="text-white font-medium">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issue Date:</span>
                    <span className="text-white">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Due Date:</span>
                    <span className="text-white">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-600">
                    <span className="text-gray-400 font-medium">Status:</span>
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Invoice Items</h3>
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full border border-gray-500">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600 border border-gray-600">
                    {invoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-300">{item.description}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-300">${item.rate?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</td>
                        <td className="px-4 py-3 text-right text-white font-semibold"> ${item.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-700/60 text-[15px]">
                    {/* Subtotal */}
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-gray-300 font-medium" >
                        Subtotal
                      </td>
                      <td className="px-6 py-3 text-right text-white font-semibold">
                        $
                        {invoice.subtotal?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                      </td>
                    </tr>

                    {/* Tax */}
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-gray-300 font-medium" >
                        Tax
                      </td>
                      <td className="px-6 py-3 text-right text-white font-semibold">
                        $
                        {invoice.taxAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                      </td>
                    </tr>

                    {/* Discount */}
                    {invoice.discountAmount > 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-right text-gray-300 font-medium" >
                          Discount
                        </td>
                        <td className="px-6 py-3 text-right text-green-400 font-semibold">
                          − $
                          {invoice.discountAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                        </td>
                      </tr>
                    )}
                    {/* Grand Total */}
                    <tr className="bg-gray-800 border-t border-gray-600">
                      <td colSpan="3" className="px-6 py-4 text-right text-lg font-bold text-white" >
                        Total
                      </td>
                      <td className="px-6 py-4 text-right text-lg font-bold text-blue-400">
                        $
                        {invoice.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-lg border border-green-700">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-white">Total Amount Paid:</span>
                <span className="text-3xl font-bold text-white">${invoice.totalPaid?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-lg border border-red-700">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-white">Total Amount Due:</span>
                <span className="text-3xl font-bold text-white">${invoice.remainingAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
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

            {invoice.status?.toLowerCase() === 'pending' || invoice.status?.toLowerCase() === 'sent' && (
              <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
                <p className="text-yellow-300 text-center">
                  ⚠️ This invoice is pending payment. Please make the payment before the due date.
                </p>
              </div>
            )}

            {invoice.status?.toLowerCase() === 'overdue' && (
              <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
                <p className="text-red-300 text-center">
                  ⚠️ This invoice is overdue. Please make the payment as soon as possible.
                </p>
              </div>
            )}

            {invoice.status?.toLowerCase() === 'paid' && (
              <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg">
                <p className="text-green-300 text-center">
                  ✓ This invoice has been paid. Thank you for your payment!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <GeneratePdfModal
        isOpen={isGeneratePdfModalOpen}
        onClose={() => setIsGeneratePdfModalOpen(false)}
        onConfirm={handleGeneratePDF}
      />
    </div>
  );
}

export default ViewInvoice;