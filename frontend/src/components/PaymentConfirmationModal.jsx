import React from "react";
import { CreditCard, X } from "lucide-react";

const PaymentConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  transactionId,
  setTransactionId,
  actionLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-700 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5 cursor-pointer" />
        </button>

        {/* Header */}
        <div className="flex items-center mb-5">
          <CreditCard className="w-6 h-6 text-green-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">
            Confirm Payment
          </h2>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          {/* Amount Received */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount Received ($)
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter amount"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Id
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Id"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select method</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!paymentAmount || !paymentMethod || actionLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
