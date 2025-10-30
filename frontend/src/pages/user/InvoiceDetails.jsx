import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
// import api from '../../config/api';
import { ArrowLeft, Download, Mail, Edit, Trash2, FileText, RefreshCw } from 'lucide-react';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
    //   const response = await api.get(`/invoice/${id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    setActionLoading(true);
    try {
      await api.post(`/email/send-invoice/${id}`);
      setMessage('Invoice sent successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Failed to send invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminder = async () => {
    setActionLoading(true);
    try {
      await api.post(`/email/send-reminder/${id}`);
      setMessage('Payment reminder sent successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Failed to send reminder');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/invoice/${id}`, { status: newStatus });
      setInvoice({ ...invoice, status: newStatus });
      setMessage('Status updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/pdf/download/${id}`, { responseType: 'blob' });
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

  const handleRegeneratePDF = async () => {
    setActionLoading(true);
    try {
      await api.put(`/pdf/regenerate/${id}`);
      setMessage('PDF regenerated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('Failed to regenerate PDF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoice/${id}`);
        navigate('/user/invoices');
      } catch (error) {
        alert('Failed to delete invoice');
      }
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
        <Link to="/user/invoices" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
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
              <h1 className="text-2xl font-bold text-white">Invoice #{invoice.invoiceNumber}</h1>
              <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status}
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
                onClick={handleDelete}
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
                <h3 className="text-lg font-semibold text-white mb-3">Client Information</h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <p className="text-gray-300"><span className="font-medium">Name:</span> {invoice.client?.name}</p>
                  <p className="text-gray-300"><span className="font-medium">Email:</span> {invoice.client?.email}</p>
                  <p className="text-gray-300"><span className="font-medium">Phone:</span> {invoice.client?.phone}</p>
                  {invoice.client?.address && (
                    <p className="text-gray-300"><span className="font-medium">Address:</span> {invoice.client?.address}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Invoice Details</h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <p className="text-gray-300"><span className="font-medium">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                  <p className="text-gray-300"><span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-gray-300"><span className="font-medium">Total:</span> ${invoice.total?.toFixed(2)}</p>
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
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {invoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-gray-300">{item.description}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-300">${item.price?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-white font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-600">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right text-white font-bold">Total:</td>
                      <td className="px-4 py-3 text-right text-white font-bold text-lg">
                        ${invoice.total?.toFixed(2)}
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
                <button
                  onClick={handleRegeneratePDF}
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Regenerate PDF
                </button>
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
              <h3 className="text-lg font-semibold text-white mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleStatusChange('draft')}
                  disabled={actionLoading || invoice.status === 'draft'}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Draft
                </button>
                <button
                  onClick={() => handleStatusChange('pending')}
                  disabled={actionLoading || invoice.status === 'pending'}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Pending
                </button>
                <button
                  onClick={() => handleStatusChange('paid')}
                  disabled={actionLoading || invoice.status === 'paid'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => handleStatusChange('overdue')}
                  disabled={actionLoading || invoice.status === 'overdue'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark as Overdue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetails;