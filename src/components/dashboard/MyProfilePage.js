import React, { useState } from 'react';
import { User, Save } from 'lucide-react';

const MyProfilePage = ({ member, isAdmin, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    email: member.email || '',
    phone: member.phone || '',
    role: member.role || 'member',
    notificationPreference: member.notificationPreference || 'email',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (
      (formData.notificationPreference === 'sms' || formData.notificationPreference === 'both') &&
      !formData.phone.trim()
    ) {
      newErrors.notificationPreference = 'Phone number is required for SMS notifications';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const updates = { ...formData };
      delete updates.role;
      delete updates.email;
      updates.notificationPreference = formData.notificationPreference;
      onSave(member.id, updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#071D3915' }}>
            <User className="w-6 h-6" style={{ color: '#071D39' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#071D39' }}>My Profile</h1>
            <p className="text-sm" style={{ color: '#516469' }}>Manage your personal information and preferences</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8 max-w-xl">
        {/* Success message */}
        {saved && (
          <div className="mb-6 p-3 rounded text-sm font-semibold" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
            Profile saved successfully!
          </div>
        )}

        <div className="space-y-5">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-3 rounded border text-sm"
              style={{
                borderColor: errors.firstName ? '#DC2626' : '#89A8B1',
                color: '#071D39',
              }}
            />
            {errors.firstName && (
              <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full p-3 rounded border text-sm"
              style={{
                borderColor: errors.lastName ? '#DC2626' : '#89A8B1',
                color: '#071D39',
              }}
            />
            {errors.lastName && (
              <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.lastName}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full p-3 rounded border text-sm"
              style={{ borderColor: '#E2E8F0', backgroundColor: '#F7FAFC', color: '#89A8B1' }}
            />
            <p className="text-xs mt-1" style={{ color: '#89A8B1' }}>Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 rounded border text-sm"
              style={{ borderColor: '#89A8B1', color: '#071D39' }}
            />
          </div>

          {/* Role (read-only for self) */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              Role
            </label>
            <div
              className="w-full p-3 rounded border text-sm"
              style={{ borderColor: '#E2E8F0', backgroundColor: '#F7FAFC', color: '#516469' }}
            >
              {formData.role === 'admin' ? 'Admin' : 'Member'}
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#071D39' }}>
              Notification Preferences
            </label>
            <div className="space-y-2">
              {[
                { value: 'email', label: 'Email only' },
                { value: 'sms', label: 'SMS only' },
                { value: 'both', label: 'Both (Email + SMS)' },
                { value: 'none', label: 'None' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#071D39' }}>
                  <input
                    type="radio"
                    name="notificationPreference"
                    value={option.value}
                    checked={formData.notificationPreference === option.value}
                    onChange={(e) =>
                      setFormData({ ...formData, notificationPreference: e.target.value })
                    }
                    className="w-4 h-4"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.notificationPreference && (
              <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.notificationPreference}</p>
            )}
          </div>

          {/* Save button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded font-semibold text-white"
              style={{ backgroundColor: '#071D39' }}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
