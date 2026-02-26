import React, { useState } from 'react';

const TeamSettings = ({ 
  teamMembers, 
  onAddMember, 
  onRemoveMember, 
  onEditMember, 
  defaultAssignments, 
  onSaveDefaults,
  sellerTemplate,
  buyerTemplate,
  isAdmin 
}) => {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberAssignments, setMemberAssignments] = useState([]);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'member' });

  const getAllTasks = () => {
    const sellerTasks = sellerTemplate.flatMap(theme => 
      theme.activities.map(act => ({
        id: `seller-${theme.theme}-${act.name}`,
        name: act.name,
        theme: theme.theme,
        type: 'Seller'
      }))
    );
    const buyerTasks = buyerTemplate.flatMap(theme => 
      theme.activities.map(act => ({
        id: `buyer-${theme.theme}-${act.name}`,
        name: act.name,
        theme: theme.theme,
        type: 'Buyer'
      }))
    );
    return [...sellerTasks, ...buyerTasks];
  };

  const allTasks = getAllTasks();

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    const assigned = Object.entries(defaultAssignments)
      .filter(([_, userId]) => userId === member.id)
      .map(([taskId]) => taskId);
    setMemberAssignments(assigned);
  };

  const handleToggleTask = (taskId) => {
    setMemberAssignments(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSaveAssignments = () => {
    if (!selectedMember) return;
    
    const newAssignments = { ...defaultAssignments };
    
    Object.keys(newAssignments).forEach(taskId => {
      if (newAssignments[taskId] === selectedMember.id) {
        delete newAssignments[taskId];
      }
    });
    
    memberAssignments.forEach(taskId => {
      newAssignments[taskId] = selectedMember.id;
    });
    
    onSaveDefaults(newAssignments);
    alert('Default assignments saved!');
  };

  const handleAddMember = () => {
    if (newMember.firstName && newMember.lastName && newMember.email) {
      onAddMember(newMember);
      setNewMember({ firstName: '', lastName: '', email: '', phone: '', role: 'member' });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#071D39' }}>Team Settings</h1>
      
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2 px-4 font-semibold ${activeTab === 'members' ? 'border-b-2' : ''}`}
          style={{ 
            borderColor: activeTab === 'members' ? '#071D39' : 'transparent',
            color: activeTab === 'members' ? '#071D39' : '#516469'
          }}
        >
          Team Members
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-2 px-4 font-semibold ${activeTab === 'assignments' ? 'border-b-2' : ''}`}
          style={{ 
            borderColor: activeTab === 'assignments' ? '#071D39' : 'transparent',
            color: activeTab === 'assignments' ? '#071D39' : '#516469'
          }}
        >
          Default Task Assignments
        </button>
      </div>

      {activeTab === 'members' && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#071D39' }}>Add New Team Member</h2>
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
            <input
              type="text"
              placeholder="First Name"
              value={newMember.firstName}
              onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newMember.lastName}
              onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newMember.phone}
              onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
              className="p-3 border rounded"
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
              className="p-3 border rounded"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleAddMember}
              className="p-3 rounded font-semibold"
              style={{ backgroundColor: '#75BB2E', color: '#FFFFFF' }}
            >
              Add Team Member
            </button>
          </div>

          <h2 className="text-lg font-semibold mb-4" style={{ color: '#071D39' }}>Current Team Members</h2>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 rounded-lg flex justify-between items-center" style={{ backgroundColor: '#F5F5F5' }}>
                <div>
                  <div className="font-semibold">
                    {member.firstName} {member.lastName}
                    {member.role === 'admin' && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: '#516469' }}>{member.email}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditMember(member)}
                    className="px-3 py-1 text-sm rounded font-semibold"
                    style={{ backgroundColor: '#E0E7FF', color: '#3730A3' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="px-3 py-1 text-sm rounded font-semibold"
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="flex gap-6">
          <div className="w-1/3">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#071D39' }}>Select Team Member</h2>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className={`w-full text-left p-3 rounded-lg border-2 ${selectedMember?.id === member.id ? 'border-blue-500' : 'border-transparent'}`}
                  style={{ backgroundColor: selectedMember?.id === member.id ? '#EFF6FF' : '#F5F5F5' }}
                >
                  <div className="font-semibold">{member.firstName} {member.lastName}</div>
                  <div className="text-xs" style={{ color: '#516469' }}>
                    {Object.values(defaultAssignments).filter(id => id === member.id).length} tasks assigned
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="w-2/3">
            {selectedMember ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold" style={{ color: '#071D39' }}>
                    Default Tasks for {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  <button
                    onClick={handleSaveAssignments}
                    className="px-4 py-2 rounded font-semibold"
                    style={{ backgroundColor: '#75BB2E', color: '#FFFFFF' }}
                  >
                    Save Assignments
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide" style={{ color: '#516469' }}>Seller Tasks</h3>
                  <div className="max-h-64 overflow-y-auto space-y-1 p-3 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                    {allTasks.filter(t => t.type === 'Seller').map((task) => (
                      <label key={task.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={memberAssignments.includes(task.id)}
                          onChange={() => handleToggleTask(task.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{task.name}</span>
                        <span className="text-xs ml-auto" style={{ color: '#89A8B1' }}>{task.theme}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide" style={{ color: '#516469' }}>Buyer Tasks</h3>
                  <div className="max-h-64 overflow-y-auto space-y-1 p-3 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                    {allTasks.filter(t => t.type === 'Buyer').map((task) => (
                      <label key={task.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={memberAssignments.includes(task.id)}
                          onChange={() => handleToggleTask(task.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{task.name}</span>
                        <span className="text-xs ml-auto" style={{ color: '#89A8B1' }}>{task.theme}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12" style={{ color: '#516469' }}>
                Select a team member to configure their default task assignments
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSettings;
