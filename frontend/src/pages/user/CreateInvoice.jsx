import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import api from '../../config/api';
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { createInv } from "../../apis/invoice.apis.js";
import { getAllClients } from "../../apis/user.apis.js";
import { generateInvoicePDF } from "../../apis/pdf.api.js";
import { sendInvoice } from "../../apis/email.apis.js";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    clientId: "",
    dueDate: "",
    items: [],
    terms: "",
    notes: "",
    discountAmount: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = Cookies.get("token");
      console.log("Token: ", token);

      const response = await axios.get(getAllClients, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Clients Data:\n ", response.data);

      setClients(response.data.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return (
        sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
      );
    }, 0);

    const discount = parseFloat(formData.discountAmount) || 0;

    return subtotal - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = Cookies.get("token");
      console.log("Token: ", token);

      const response = await axios.post(createInv, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Invoice Created:\n ", response.data);

      navigate("/user/invoices");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

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

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">
                Create New Invoice
              </h1>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client *
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select a client
                  </option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Invoice Items
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Item description"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <input
                          type="number"
                          value={
                            item.quantity === 0 || item.quantity === ""
                              ? ""
                              : item.quantity
                          }
                          // value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Quantity"
                          min="1"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <input
                          type="number"
                          value={
                            item.rate === 0 || item.rate === "" ? "" : item.rate
                          }
                          // value={item.rate}
                          onChange={(e) =>
                            handleItemChange(index, "rate", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="rate"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="md:col-span-1 flex items-center justify-center">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-right text-gray-300">
                      Subtotal: $
                      {(
                        (parseFloat(item.quantity) || 0) *
                        (parseFloat(item.rate) || 0)
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-700 rounded-lg px-4 py-3 border border-gray-600">
              <span className="text-md font-medium text-gray-300">
                Discount Amount:
              </span>

              <div className="flex items-center">
                <span className="text-white text-md mr-1 mr-2">$</span>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount || ""}
                  onChange={handleChange}
                  className="bg-transparent text-right text-white text-lg font-semibold w-24 border border-gray-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-300">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-white">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Terms
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Terms..."
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
                rows="4"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                to="/user/invoices"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
