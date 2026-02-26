import React, { useState } from 'react';
import { X } from 'lucide-react';

const TaskDetailPanel = ({ task, project, onClose, onUpdate, teamMembers }) => {
  const [userNotes, setUserNotes] = useState(task.userNotes || '');
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');

  const handleSave = () => {
    onUpdate({ userNotes, status, assignedTo });
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l flex flex-col z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-lg">Task Details</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Task Name</label>
          <div className="text-gray-700">{task.name}</div>
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
            <option value="not-applicable">Not Applicable (N/A)</option>
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
      <div className="p-4 border-t">
        <button
          onClick={handleSave}
          className="w-full text-white p-3 rounded font-semibold" style={{ backgroundColor: '#75BB2E' }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
