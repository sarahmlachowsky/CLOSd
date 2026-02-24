import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditProjectModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: project.type,
    clientName: project.clientName,
    phone: project.phone || '',
    email: project.email || '',
    propertyAddress: project.propertyAddress,
    contractDate: project.contractDate || ''
  });

  const handleSubmit = () => {
    if (formData.clientName && formData.propertyAddress) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Deal</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Deal Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 border rounded"
            >
              <option>Seller</option>
              <option>Buyer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Client Name(s)</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="John and Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number(s)</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="555-1234"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address(es)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="client@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Property Address</label>
            <input
              type="text"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="123 Main St, Jacksonville, FL"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Under Contract Date</label>
            <input
              type="date"
              value={formData.contractDate}
              onChange={(e) => setFormData({...formData, contractDate: e.target.value})}
              className="w-full p-3 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded font-semibold border-2"
              style={{ borderColor: '#89A8B1', color: '#516469' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;