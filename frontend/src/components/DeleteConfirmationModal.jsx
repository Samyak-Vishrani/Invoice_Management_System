import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-md border border-gray-700 p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5 cursor-pointer" />
        </button>

        {/* Header */}
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold text-white">Confirm Delete</h2>
        </div>

        {/* Message */}
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete{" "}
          <span className="text-red-400 font-medium">{itemName}</span>? <br />
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default DeleteConfirmationModal;