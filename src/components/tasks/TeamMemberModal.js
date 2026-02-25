import React, { useState } from 'react';
import { X } from 'lucide-react';

const TeamMemberModal = ({ onClose, onAdd, onRemove, onEdit, teamMembers, isAdmin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'member'
  });

  const handleSubmit = () => {
    if (formData.firstName && formData.lastName && formData.email) {
      onAdd(formData);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'member' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-screen overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Manage Team</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Add New Team Member</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="p-3 border rounded"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="p-3 border rounded"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Add Team Member
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Current Team Members</h3>
          {teamMembers.length === 0 ? (
            <p className="text-gray-500 text-sm">No team members added yet</p>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {member.firstName} {member.lastName}
                      {member.role === 'admin' && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                    {member.phone && <div className="text-sm text-gray-600">{member.phone}</div>}
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => onEdit(member)}
                        className="px-3 py-1 text-sm rounded font-semibold"
                        style={{ backgroundColor: '#E0E7FF', color: '#3730A3' }}
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => onRemove(member.id)}
                        className="px-3 py-1 text-sm rounded font-semibold"
                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberModal;
