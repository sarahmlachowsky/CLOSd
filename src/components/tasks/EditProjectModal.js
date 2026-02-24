import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditProjectModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    clientName: project?.clientName || '',
    propertyAddress: project?.propertyAddress || '',
    type: project?.type || 'Seller',
    contractDate: project?.contractDate || '',
    listPrice: project?.listPrice || '',
    contractPrice: project?.contractPrice || '',
    commissionPercent: project?.commissionPercent || '',
    brokerSplitType: project?.brokerSplitType || 'percent',
    brokerSplitValue: project?.brokerSplitValue || '',
    transactionFee: project?.transactionFee || '',
    tcFee: project?.tcFee || ''
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
            <label className="block text-sm font-medium mb-1">Contract Date</label>
            <input
              type="date"
              value={formData.contractDate}
              onChange={(e) => setFormData({...formData, contractDate: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="col-span-2 border-t pt-4 mt-2">
            <h3 className="font-semibold mb-3 tracking-wide" style={{ color: '#071D39' }}>DEAL FINANCIALS</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">List Price ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                value={formData.listPrice}
                onChange={(e) => setFormData({...formData, listPrice: Math.max(0, e.target.value)})}
                className="w-full p-2 pl-7 border rounded"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contract Price ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                value={formData.contractPrice}
                onChange={(e) => setFormData({...formData, contractPrice: Math.max(0, e.target.value)})}
                className="w-full p-2 pl-7 border rounded"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Commission (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionPercent}
                onChange={(e) => setFormData({...formData, commissionPercent: Math.max(0, Math.min(100, e.target.value))})}
                className="w-full p-2 pr-7 border rounded"
                placeholder="3"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Broker Split</label>
            <div className="flex gap-2">
              <select
                value={formData.brokerSplitType}
                onChange={(e) => setFormData({...formData, brokerSplitType: e.target.value})}
                className="p-2 border rounded bg-white"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat ($)</option>
              </select>
              <div className="relative flex-1">
                {formData.brokerSplitType === 'flat' && (
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                )}
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.brokerSplitValue}
                  onChange={(e) => setFormData({...formData, brokerSplitValue: Math.max(0, e.target.value)})}
                  className={`w-full p-2 border rounded ${formData.brokerSplitType === 'flat' ? 'pl-7' : 'pr-7'}`}
                  placeholder={formData.brokerSplitType === 'percent' ? '30' : '500'}
                />
                {formData.brokerSplitType === 'percent' && (
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Transaction Fee ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                value={formData.transactionFee}
                onChange={(e) => setFormData({...formData, transactionFee: Math.max(0, e.target.value)})}
                className="w-full p-2 pl-7 border rounded"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">TC Fee ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                value={formData.tcFee}
                onChange={(e) => setFormData({...formData, tcFee: Math.max(0, e.target.value)})}
                className="w-full p-2 pl-7 border rounded"
                placeholder="0"
              />
            </div>
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
