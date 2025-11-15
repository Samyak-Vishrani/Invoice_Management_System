import { useState } from "react";
import { X, FilePlus} from "lucide-react";

const GeneratePdfModal = ({ isOpen, onClose, onConfirm }) => {
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
          <FilePlus className="w-6 h-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-white">Generate PDF</h2>
        </div>

        {/* Message */}
        <p className="text-gray-300 mb-6">
          PDF hasn't been generated yet. Do you want to generate it now for this invoice?
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
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition cursor-pointer"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};
export default GeneratePdfModal;