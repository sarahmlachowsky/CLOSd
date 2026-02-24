import React from 'react';
import { X } from 'lucide-react';

const MyTasksModal = ({ deal, onClose, onTaskClick, getTaskColor, isTaskUrgent, modalType = 'assigned' }) => {
  const themeOrder = [
    "New Lead", "Lead", "Document Prep", "Listing Prep", "MLS", 
    "Active", "Under Contract", "Pre-close", "Closed",
    "Active Showing", "Offer Prep"
  ];
  
  const tasksByTheme = {};
  deal.tasks.forEach(task => {
    if (!tasksByTheme[task.theme]) {
      tasksByTheme[task.theme] = [];
    }
    tasksByTheme[task.theme].push(task);
  });

  const activeThemes = themeOrder.filter(theme => tasksByTheme[theme] && tasksByTheme[theme].length > 0);

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-tasks-modal-title"
    >
      <div 
        id="my-tasks-modal"
        className="bg-white rounded-lg shadow-2xl w-11/12 max-w-6xl max-h-[85vh] flex flex-col"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 id="my-tasks-modal-title" className="text-xl font-bold" style={{ color: '#071D39' }}>
              {modalType === 'overdue' && `Overdue Tasks: ${deal.projectName}`}
              {modalType === 'dueSoon' && `Due Soon: ${deal.projectName}`}
              {modalType === 'assigned' && `My Tasks: ${deal.projectName}`}
            </h2>
            <p className="text-sm" style={{ color: '#516469' }}>
              {deal.taskCount} {deal.taskCount === 1 ? 'task' : 'tasks'}
              {modalType === 'overdue' && ' overdue'}
              {modalType === 'dueSoon' && ' due within 72 hours'}
              {modalType === 'assigned' && ' assigned to you'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <div className="flex gap-4 min-h-full">
            {activeThemes.map((theme, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-72 rounded-lg p-4 flex flex-col"
                style={{ backgroundColor: '#F5F5F5', border: '1px solid #89A8B1' }}
              >
                <h3 className="font-bold mb-4 text-sm" style={{ color: '#071D39' }}>
                  {theme}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#89A8B1', color: '#071D39' }}>
                    {tasksByTheme[theme].length}
                  </span>
                </h3>
                <div className="space-y-3 flex-1">
                  {tasksByTheme[theme].map((task, taskIdx) => (
                    <div
                      key={taskIdx}
                      onClick={() => onTaskClick(task)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onTaskClick(task);
                        }
                      }}
                      className={`${getTaskColor(task)} p-3 rounded cursor-pointer hover:shadow-lg transition-shadow`}
                      style={{ 
                        border: '1px solid #89A8B1',
                        backgroundColor: task.status === 'not-started' && !isTaskUrgent(task) ? '#F5F5F5' : undefined
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open task: ${task.name}`}
                    >
                      <div className="font-medium text-sm mb-1">{task.name}</div>
                      {task.dueDate && (
                        <div className="text-xs" style={{ color: '#516469' }}>Due: {task.dueDate}</div>
                      )}
                      <div className="text-xs mt-1 capitalize" style={{ color: '#516469' }}>
                        Status: {task.status.replace('-', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasksModal;
