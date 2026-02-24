import React, { useState } from 'react';
import { X } from 'lucide-react';

const TaskDetailModal = ({ task, project, teamMembers, onClose, onUpdate }) => {
  const [userNotes, setUserNotes] = useState(task.userNotes || '');
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');

  const handleSave = () => {
    onUpdate({ userNotes, status, assignedTo });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-modal-title"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 id="task-detail-modal-title" className="font-bold text-lg">Task Details</h3>
            <p className="text-sm" style={{ color: '#516469' }}>{project?.propertyAddress}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close task details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Task Name</label>
            <div className="text-gray-700">{task.name}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Theme/Stage</label>
            <div className="text-gray-700">{task.theme}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={`${member.firstName} ${member.lastName}`}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          {task.dueDate && (
            <div>
              <label className="block text-sm font-semibold mb-2">Due Date</label>
              <div className="text-gray-700">{task.dueDate}</div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-2">Instructions</label>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{task.notes || 'No instructions provided'}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Your Notes</label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full p-2 border rounded h-32"
              placeholder="Add your notes here..."
            />
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
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;