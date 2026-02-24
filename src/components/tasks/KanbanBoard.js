import React from 'react';

const KanbanBoard = ({ project, onTaskClick, getTaskColor, isTaskUrgent }) => {
  const themes = [...new Set(project.tasks.map(t => t.theme))];

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getUserColor = (name) => {
    if (!name) return '#516469';
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#14B8A6', '#EF4444', '#6366F1'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex gap-4 h-full items-start">
      {themes.map((theme, themeIdx) => (
        <div key={themeIdx} className="flex-shrink-0 w-80 rounded-lg p-4 flex flex-col" style={{ backgroundColor: '#F5F5F5', border: '1px solid #89A8B1', minHeight: 'fit-content' }}>
          <h3 className="font-bold mb-4" style={{ color: '#071D39' }}>{theme}</h3>
          <div className="space-y-3 flex-1">
            {project.tasks
              .filter(t => t.theme === theme)
              .map((task, taskIdx) => (
                <div
                  key={taskIdx}
                  onClick={() => onTaskClick(task)}
                  className={`${getTaskColor(task)} p-3 rounded cursor-pointer hover:shadow-lg transition-shadow`}
                  style={{ 
                    border: '1px solid #89A8B1',
                    backgroundColor: task.status === 'not-started' && !isTaskUrgent(task) ? '#F5F5F5' : undefined
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-2" style={{ color: '#000000' }}>{task.name}</div>
                      {task.dueDate && (
                        <div className="text-xs" style={{ color: '#516469' }}>Due: {task.dueDate}</div>
                      )}
                    </div>
                    {task.assignedTo && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: getUserColor(task.assignedTo), color: '#FFFFFF' }}>
                        {getInitials(task.assignedTo)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
