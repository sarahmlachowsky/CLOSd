import React from 'react';

const ArchiveConfirmModal = ({ projectAddress, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#92400E' }}>Archive This Deal?</h2>
        <p className="mb-6 text-gray-700">
          Archive the deal for <strong>{projectAddress}</strong>? You can restore it from the Deal Archive later.
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
              backgroundColor: '#F59E0B',
              color: '#FFFFFF',
              border: '2px solid #D97706'
            }}
          >
            Archive Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveConfirmModal;