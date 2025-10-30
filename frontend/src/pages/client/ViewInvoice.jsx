import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
// import api from '../../config/api';
import { ArrowLeft, Download, FileText, Building } from 'lucide-react';

const ViewInvoice = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
    //   const response = await api.get(`/invoice/${invoiceId}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/pdf/view/${invoiceId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download PDF');
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
                {invoice.status}
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
                <h3 className="text-lg font-semibold text-white mb-3">Billed To</h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <p className="text-white font-medium text-lg">{invoice.client?.name}</p>
                  <p className="text-gray-300">{invoice.client?.email}</p>
                  <p className="text-gray-300">{invoice.client?.phone}</p>
                  {invoice.client?.address && (
                    <p className="text-gray-300">{invoice.client.address}</p>
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
                    <span className="text-white">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Due Date:</span>
                    <span className="text-white">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-600">
                    <span className="text-gray-400 font-medium">Status:</span>
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Invoice Items</h3>
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {invoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-300">{item.description}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-300">${item.price?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-white font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-lg border border-green-700">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-white">Total Amount Due:</span>
                <span className="text-3xl font-bold text-white">${invoice.total?.toFixed(2)}</span>
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

            {invoice.status?.toLowerCase() === 'pending' && (
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
    </div>
  );
}

export default ViewInvoice;