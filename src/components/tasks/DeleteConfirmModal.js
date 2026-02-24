import React from 'react';

const DeleteConfirmModal = ({ projectAddress, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Deal Permanently?</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to permanently delete <strong>{projectAddress}</strong>? This will remove the deal and all its tasks. This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded font-semibold"
            style={{ 
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '2px solid #D1D5DB'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded font-semibold"
            style={{ 
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: '2px solid #DC2626'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;