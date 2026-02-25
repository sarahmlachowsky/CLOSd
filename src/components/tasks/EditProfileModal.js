import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditProfileModal = ({ member, mode, onClose, onSave, isAdmin }) => {
  const [formData, setFormData] = useState({
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    email: member.email || '',
    phone: member.phone || '',
    role: member.role || 'member',
    notificationPreference: member.notificationPreference || 'email'
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if ((formData.notificationPreference === 'sms' || formData.notificationPreference === 'both') && !formData.phone.trim()) {
      newErrors.notificationPreference = 'Phone number is required for SMS notifications';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const updates = { ...formData };
      if (!isAdmin || mode === 'self') delete updates.role;
      delete updates.email;
      // Always include notificationPreference
      updates.notificationPreference = formData.notificationPreference;
      onSave(member.id, updates);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: '#071D39' }}>
            {mode === 'self' ? 'My Profile' : 'Edit Team Member'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className={`w-full p-3 border rounded ${errors.firstName ? 'border-red-500' : ''}`}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className={`w-full p-3 border rounded ${errors.lastName ? 'border-red-500' : ''}`}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              className="w-full p-3 border rounded bg-gray-100"
              disabled
            />
            <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Role</label>
            {isAdmin && mode === 'admin' ? (
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 border rounded"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <div className="w-full p-3 border rounded bg-gray-100 text-gray-600">
                {formData.role === 'admin' ? 'Admin' : 'Member'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Notification Preferences</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="email"
                  checked={formData.notificationPreference === 'email'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>Email only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="sms"
                  checked={formData.notificationPreference === 'sms'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>SMS only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="both"
                  checked={formData.notificationPreference === 'both'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>Both (Email + SMS)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="none"
                  checked={formData.notificationPreference === 'none'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>None</span>
              </label>
            </div>
            {errors.notificationPreference && <p className="text-red-500 text-xs mt-1">{errors.notificationPreference}</p>}
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
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
  );
};

export default EditProfileModal;
